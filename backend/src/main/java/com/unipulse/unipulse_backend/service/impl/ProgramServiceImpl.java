package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.ProgramRequestDto;
import com.unipulse.unipulse_backend.dto.academic.ProgramResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Department;
import com.unipulse.unipulse_backend.model.entity.Program;
import com.unipulse.unipulse_backend.repository.DepartmentRepository;
import com.unipulse.unipulse_backend.repository.ProgramRepository;
import com.unipulse.unipulse_backend.service.ProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgramServiceImpl implements ProgramService {

    private final ProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public ProgramResponseDto createProgram(ProgramRequestDto requestDto) {
        Department department = departmentRepository.findById(requestDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDto.getDepartmentId()));

        String upperCode = requestDto.getCode().trim().toUpperCase();
        if (programRepository.existsByCode(upperCode)) {
            throw new DuplicateResourceException("Program", "code", requestDto.getCode());
        }

        Program program = Program.builder()
                .department(department)
                .code(upperCode)
                .name(requestDto.getName().trim())
                .degreeLevel(requestDto.getDegreeLevel().trim().toUpperCase())
                .totalCredits(requestDto.getTotalCredits())
                .build();

        Program savedProgram = programRepository.save(program);
        return mapToResponseDto(savedProgram);
    }

    @Override
    @Transactional
    public ProgramResponseDto updateProgram(UUID id, ProgramRequestDto requestDto) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", id));

        Department department = departmentRepository.findById(requestDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDto.getDepartmentId()));

        String upperCode = requestDto.getCode().trim().toUpperCase();
        if (programRepository.existsByCodeAndIdNot(upperCode, id)) {
            throw new DuplicateResourceException("Program", "code", requestDto.getCode());
        }

        program.setDepartment(department);
        program.setCode(upperCode);
        program.setName(requestDto.getName().trim());
        program.setDegreeLevel(requestDto.getDegreeLevel().trim().toUpperCase());
        program.setTotalCredits(requestDto.getTotalCredits());

        Program updatedProgram = programRepository.save(program);
        return mapToResponseDto(updatedProgram);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramResponseDto getProgramById(UUID id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", id));
        return mapToResponseDto(program);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramResponseDto getProgramByCode(String code) {
        Program program = programRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Program", "code", code));
        return mapToResponseDto(program);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProgramResponseDto> getAllPrograms(UUID departmentId, String search, Pageable pageable) {
        Page<Program> page;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        String searchTerm = hasSearch ? search.trim() : "";

        if (departmentId != null && hasSearch) {
            page = programRepository.findByDepartmentIdAndNameContainingIgnoreCaseOrDepartmentIdAndCodeContainingIgnoreCase(
                    departmentId, searchTerm, departmentId, searchTerm, pageable);
        } else if (departmentId != null) {
            page = programRepository.findByDepartmentId(departmentId, pageable);
        } else if (hasSearch) {
            page = programRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(searchTerm, searchTerm, pageable);
        } else {
            page = programRepository.findAll(pageable);
        }

        Page<ProgramResponseDto> dtoPage = page.map(this::mapToResponseDto);
        return PagedResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> getProgramsByDepartmentId(UUID departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department", "id", departmentId);
        }
        return programRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteProgram(UUID id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", id));

        Long studentCount = programRepository.countStudentsByProgramId(id);
        if (studentCount != null && studentCount > 0) {
            throw new BadRequestException("Cannot delete Program because it has " + studentCount + " enrolled student(s)");
        }

        programRepository.delete(program);
    }

    private ProgramResponseDto mapToResponseDto(Program program) {
        Long studentCount = programRepository.countStudentsByProgramId(program.getId());

        return ProgramResponseDto.builder()
                .id(program.getId())
                .departmentId(program.getDepartment().getId())
                .departmentName(program.getDepartment().getName())
                .departmentCode(program.getDepartment().getCode())
                .facultyId(program.getDepartment().getFaculty().getId())
                .facultyName(program.getDepartment().getFaculty().getName())
                .code(program.getCode())
                .name(program.getName())
                .degreeLevel(program.getDegreeLevel())
                .totalCredits(program.getTotalCredits())
                .studentCount(studentCount != null ? studentCount : 0L)
                .createdAt(program.getCreatedAt())
                .build();
    }
}
