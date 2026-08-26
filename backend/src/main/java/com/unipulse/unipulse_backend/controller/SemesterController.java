package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.academic.SemesterRequestDto;
import com.unipulse.unipulse_backend.dto.academic.SemesterResponseDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.service.SemesterService;
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
@RequestMapping("/api/v1/semesters")
@RequiredArgsConstructor
public class SemesterController {

    private final SemesterService semesterService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<PagedResponse<SemesterResponseDto>>> getAllSemesters(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<SemesterResponseDto> response = semesterService.getAllSemesters(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Semesters retrieved successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<SemesterResponseDto>>> getAllSemestersList() {
        List<SemesterResponseDto> response = semesterService.getAllSemestersList();
        return ResponseEntity.ok(ApiResponse.success(response, "Semesters list retrieved successfully"));
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<SemesterResponseDto>> getCurrentSemester() {
        SemesterResponseDto response = semesterService.getCurrentSemester();
        return ResponseEntity.ok(ApiResponse.success(response, "Current semester retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<SemesterResponseDto>> getSemesterById(@PathVariable UUID id) {
        SemesterResponseDto response = semesterService.getSemesterById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Semester retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SemesterResponseDto>> createSemester(@Valid @RequestBody SemesterRequestDto requestDto) {
        SemesterResponseDto response = semesterService.createSemester(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Semester created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SemesterResponseDto>> updateSemester(
            @PathVariable UUID id,
            @Valid @RequestBody SemesterRequestDto requestDto
    ) {
        SemesterResponseDto response = semesterService.updateSemester(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Semester updated successfully"));
    }

    @PatchMapping("/{id}/set-current")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SemesterResponseDto>> setCurrentSemester(@PathVariable UUID id) {
        SemesterResponseDto response = semesterService.setCurrentSemester(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Current semester updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSemester(@PathVariable UUID id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Semester deleted successfully"));
    }
}
