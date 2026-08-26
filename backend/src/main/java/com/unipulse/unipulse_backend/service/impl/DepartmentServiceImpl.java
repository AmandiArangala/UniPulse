package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.DepartmentRequestDto;
import com.unipulse.unipulse_backend.dto.academic.DepartmentResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Department;
import com.unipulse.unipulse_backend.model.entity.Faculty;
import com.unipulse.unipulse_backend.repository.DepartmentRepository;
import com.unipulse.unipulse_backend.repository.FacultyRepository;
import com.unipulse.unipulse_backend.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;

    @Override
    @Transactional
    public DepartmentResponseDto createDepartment(DepartmentRequestDto requestDto) {
        Faculty faculty = facultyRepository.findById(requestDto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", requestDto.getFacultyId()));

        String upperCode = requestDto.getCode().trim().toUpperCase();
        if (departmentRepository.existsByCode(upperCode)) {
            throw new DuplicateResourceException("Department", "code", requestDto.getCode());
        }

        Department department = Department.builder()
                .faculty(faculty)
                .code(upperCode)
                .name(requestDto.getName().trim())
                .build();

        Department savedDepartment = departmentRepository.save(department);
        return mapToResponseDto(savedDepartment);
    }

    @Override
    @Transactional
    public DepartmentResponseDto updateDepartment(UUID id, DepartmentRequestDto requestDto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        Faculty faculty = facultyRepository.findById(requestDto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", requestDto.getFacultyId()));

        String upperCode = requestDto.getCode().trim().toUpperCase();
        if (departmentRepository.existsByCodeAndIdNot(upperCode, id)) {
            throw new DuplicateResourceException("Department", "code", requestDto.getCode());
        }

        department.setFaculty(faculty);
        department.setCode(upperCode);
        department.setName(requestDto.getName().trim());

        Department updatedDepartment = departmentRepository.save(department);
        return mapToResponseDto(updatedDepartment);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDto getDepartmentById(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToResponseDto(department);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDto getDepartmentByCode(String code) {
        Department department = departmentRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "code", code));
        return mapToResponseDto(department);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DepartmentResponseDto> getAllDepartments(UUID facultyId, String search, Pageable pageable) {
        Page<Department> page;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        String searchTerm = hasSearch ? search.trim() : "";

        if (facultyId != null && hasSearch) {
            page = departmentRepository.findByFacultyIdAndNameContainingIgnoreCaseOrFacultyIdAndCodeContainingIgnoreCase(
                    facultyId, searchTerm, facultyId, searchTerm, pageable);
        } else if (facultyId != null) {
            page = departmentRepository.findByFacultyId(facultyId, pageable);
        } else if (hasSearch) {
            page = departmentRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(searchTerm, searchTerm, pageable);
        } else {
            page = departmentRepository.findAll(pageable);
        }

        Page<DepartmentResponseDto> dtoPage = page.map(this::mapToResponseDto);
        return PagedResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponseDto> getDepartmentsByFacultyId(UUID facultyId) {
        if (!facultyRepository.existsById(facultyId)) {
            throw new ResourceNotFoundException("Faculty", "id", facultyId);
        }
        return departmentRepository.findByFacultyId(facultyId).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteDepartment(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        Long progCount = departmentRepository.countProgramsByDepartmentId(id);
        if (progCount != null && progCount > 0) {
            throw new BadRequestException("Cannot delete Department because it has " + progCount + " associated program(s)");
        }

        Long modCount = departmentRepository.countModulesByDepartmentId(id);
        if (modCount != null && modCount > 0) {
            throw new BadRequestException("Cannot delete Department because it has " + modCount + " associated module(s)");
        }

        departmentRepository.delete(department);
    }

    private DepartmentResponseDto mapToResponseDto(Department department) {
        Long progCount = departmentRepository.countProgramsByDepartmentId(department.getId());
        Long modCount = departmentRepository.countModulesByDepartmentId(department.getId());

        return DepartmentResponseDto.builder()
                .id(department.getId())
                .facultyId(department.getFaculty().getId())
                .facultyName(department.getFaculty().getName())
                .facultyCode(department.getFaculty().getCode())
                .code(department.getCode())
                .name(department.getName())
                .programCount(progCount != null ? progCount : 0L)
                .moduleCount(modCount != null ? modCount : 0L)
                .createdAt(department.getCreatedAt())
                .build();
    }
}
