package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.DepartmentRequestDto;
import com.unipulse.unipulse_backend.dto.academic.DepartmentResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {
    DepartmentResponseDto createDepartment(DepartmentRequestDto requestDto);
    DepartmentResponseDto updateDepartment(UUID id, DepartmentRequestDto requestDto);
    DepartmentResponseDto getDepartmentById(UUID id);
    DepartmentResponseDto getDepartmentByCode(String code);
    PagedResponse<DepartmentResponseDto> getAllDepartments(UUID facultyId, String search, Pageable pageable);
    List<DepartmentResponseDto> getDepartmentsByFacultyId(UUID facultyId);
    void deleteDepartment(UUID id);
}
