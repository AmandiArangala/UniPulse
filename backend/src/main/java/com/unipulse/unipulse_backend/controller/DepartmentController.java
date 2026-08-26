package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.academic.DepartmentRequestDto;
import com.unipulse.unipulse_backend.dto.academic.DepartmentResponseDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<PagedResponse<DepartmentResponseDto>>> getAllDepartments(
            @RequestParam(required = false) UUID facultyId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<DepartmentResponseDto> response = departmentService.getAllDepartments(facultyId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Departments retrieved successfully"));
    }

    @GetMapping("/faculty/{facultyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<DepartmentResponseDto>>> getDepartmentsByFacultyId(@PathVariable UUID facultyId) {
        List<DepartmentResponseDto> response = departmentService.getDepartmentsByFacultyId(facultyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Faculty departments retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<DepartmentResponseDto>> getDepartmentById(@PathVariable UUID id) {
        DepartmentResponseDto response = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Department retrieved successfully"));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<DepartmentResponseDto>> getDepartmentByCode(@PathVariable String code) {
        DepartmentResponseDto response = departmentService.getDepartmentByCode(code);
        return ResponseEntity.ok(ApiResponse.success(response, "Department retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponseDto>> createDepartment(@Valid @RequestBody DepartmentRequestDto requestDto) {
        DepartmentResponseDto response = departmentService.createDepartment(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Department created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponseDto>> updateDepartment(
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentRequestDto requestDto
    ) {
        DepartmentResponseDto response = departmentService.updateDepartment(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Department deleted successfully"));
    }
}
