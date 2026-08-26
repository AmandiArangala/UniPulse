package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.FacultyRequestDto;
import com.unipulse.unipulse_backend.dto.academic.FacultyResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Faculty;
import com.unipulse.unipulse_backend.repository.FacultyRepository;
import com.unipulse.unipulse_backend.service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;

    @Override
    @Transactional
    public FacultyResponseDto createFaculty(FacultyRequestDto requestDto) {
        if (facultyRepository.existsByCode(requestDto.getCode().trim().toUpperCase())) {
            throw new DuplicateResourceException("Faculty", "code", requestDto.getCode());
        }

        Faculty faculty = Faculty.builder()
                .code(requestDto.getCode().trim().toUpperCase())
                .name(requestDto.getName().trim())
                .description(requestDto.getDescription() != null ? requestDto.getDescription().trim() : null)
                .build();

        Faculty savedFaculty = facultyRepository.save(faculty);
        return mapToResponseDto(savedFaculty);
    }

    @Override
    @Transactional
    public FacultyResponseDto updateFaculty(UUID id, FacultyRequestDto requestDto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));

        String upperCode = requestDto.getCode().trim().toUpperCase();
        if (facultyRepository.existsByCodeAndIdNot(upperCode, id)) {
            throw new DuplicateResourceException("Faculty", "code", requestDto.getCode());
        }

        faculty.setCode(upperCode);
        faculty.setName(requestDto.getName().trim());
        faculty.setDescription(requestDto.getDescription() != null ? requestDto.getDescription().trim() : null);

        Faculty updatedFaculty = facultyRepository.save(faculty);
        return mapToResponseDto(updatedFaculty);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDto getFacultyById(UUID id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        return mapToResponseDto(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDto getFacultyByCode(String code) {
        Faculty faculty = facultyRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "code", code));
        return mapToResponseDto(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FacultyResponseDto> getAllFaculties(String search, Pageable pageable) {
        Page<Faculty> page;
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = search.trim();
            page = facultyRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(searchTerm, searchTerm, pageable);
        } else {
            page = facultyRepository.findAll(pageable);
        }

        Page<FacultyResponseDto> dtoPage = page.map(this::mapToResponseDto);
        return PagedResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyResponseDto> getAllFacultiesList() {
        return facultyRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteFaculty(UUID id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));

        Long deptCount = facultyRepository.countDepartmentsByFacultyId(id);
        if (deptCount != null && deptCount > 0) {
            throw new BadRequestException("Cannot delete Faculty because it still has " + deptCount + " associated department(s)");
        }

        facultyRepository.delete(faculty);
    }

    private FacultyResponseDto mapToResponseDto(Faculty faculty) {
        Long deptCount = facultyRepository.countDepartmentsByFacultyId(faculty.getId());
        return FacultyResponseDto.builder()
                .id(faculty.getId())
                .code(faculty.getCode())
                .name(faculty.getName())
                .description(faculty.getDescription())
                .departmentCount(deptCount != null ? deptCount : 0L)
                .createdAt(faculty.getCreatedAt())
                .build();
    }
}
