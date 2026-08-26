package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.academic.FacultyRequestDto;
import com.unipulse.unipulse_backend.dto.academic.FacultyResponseDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.service.FacultyService;
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
@RequestMapping("/api/v1/faculties")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<PagedResponse<FacultyResponseDto>>> getAllFaculties(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<FacultyResponseDto> response = facultyService.getAllFaculties(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Faculties retrieved successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<FacultyResponseDto>>> getAllFacultiesList() {
        List<FacultyResponseDto> response = facultyService.getAllFacultiesList();
        return ResponseEntity.ok(ApiResponse.success(response, "Faculties list retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<FacultyResponseDto>> getFacultyById(@PathVariable UUID id) {
        FacultyResponseDto response = facultyService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Faculty retrieved successfully"));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<FacultyResponseDto>> getFacultyByCode(@PathVariable String code) {
        FacultyResponseDto response = facultyService.getFacultyByCode(code);
        return ResponseEntity.ok(ApiResponse.success(response, "Faculty retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacultyResponseDto>> createFaculty(@Valid @RequestBody FacultyRequestDto requestDto) {
        FacultyResponseDto response = facultyService.createFaculty(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Faculty created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacultyResponseDto>> updateFaculty(
            @PathVariable UUID id,
            @Valid @RequestBody FacultyRequestDto requestDto
    ) {
        FacultyResponseDto response = facultyService.updateFaculty(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Faculty updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable UUID id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty deleted successfully"));
    }
}
