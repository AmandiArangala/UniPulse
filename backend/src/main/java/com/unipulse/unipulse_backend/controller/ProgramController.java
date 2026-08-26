package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.academic.ProgramRequestDto;
import com.unipulse.unipulse_backend.dto.academic.ProgramResponseDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.service.ProgramService;
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
@RequestMapping("/api/v1/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<PagedResponse<ProgramResponseDto>>> getAllPrograms(
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<ProgramResponseDto> response = programService.getAllPrograms(departmentId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Programs retrieved successfully"));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> getProgramsByDepartmentId(@PathVariable UUID departmentId) {
        List<ProgramResponseDto> response = programService.getProgramsByDepartmentId(departmentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Department programs retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<ProgramResponseDto>> getProgramById(@PathVariable UUID id) {
        ProgramResponseDto response = programService.getProgramById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Program retrieved successfully"));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<ProgramResponseDto>> getProgramByCode(@PathVariable String code) {
        ProgramResponseDto response = programService.getProgramByCode(code);
        return ResponseEntity.ok(ApiResponse.success(response, "Program retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProgramResponseDto>> createProgram(@Valid @RequestBody ProgramRequestDto requestDto) {
        ProgramResponseDto response = programService.createProgram(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Program created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProgramResponseDto>> updateProgram(
            @PathVariable UUID id,
            @Valid @RequestBody ProgramRequestDto requestDto
    ) {
        ProgramResponseDto response = programService.updateProgram(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Program updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable UUID id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Program deleted successfully"));
    }
}
