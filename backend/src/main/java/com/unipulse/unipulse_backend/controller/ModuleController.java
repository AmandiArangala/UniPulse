package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.academic.ModuleRequestDto;
import com.unipulse.unipulse_backend.dto.academic.ModuleResponseDto;
import com.unipulse.unipulse_backend.dto.academic.PrerequisiteLinkRequestDto;
import com.unipulse.unipulse_backend.dto.academic.PrerequisiteResponseDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.service.ModuleService;
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
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<PagedResponse<ModuleResponseDto>>> getAllModules(
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "code") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<ModuleResponseDto> response = moduleService.getAllModules(departmentId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Modules retrieved successfully"));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<ModuleResponseDto>>> getModulesByDepartmentId(@PathVariable UUID departmentId) {
        List<ModuleResponseDto> response = moduleService.getModulesByDepartmentId(departmentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Department modules retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<ModuleResponseDto>> getModuleById(@PathVariable UUID id) {
        ModuleResponseDto response = moduleService.getModuleById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Module retrieved successfully"));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<ModuleResponseDto>> getModuleByCode(@PathVariable String code) {
        ModuleResponseDto response = moduleService.getModuleByCode(code);
        return ResponseEntity.ok(ApiResponse.success(response, "Module retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ModuleResponseDto>> createModule(@Valid @RequestBody ModuleRequestDto requestDto) {
        ModuleResponseDto response = moduleService.createModule(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Module created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ModuleResponseDto>> updateModule(
            @PathVariable UUID id,
            @Valid @RequestBody ModuleRequestDto requestDto
    ) {
        ModuleResponseDto response = moduleService.updateModule(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Module updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteModule(@PathVariable UUID id) {
        moduleService.deleteModule(id);
        return ResponseEntity.ok(ApiResponse.success("Module deleted successfully"));
    }

    @GetMapping("/{id}/prerequisites")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<Set<PrerequisiteResponseDto>>> getModulePrerequisites(@PathVariable UUID id) {
        Set<PrerequisiteResponseDto> response = moduleService.getModulePrerequisites(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Module prerequisites retrieved successfully"));
    }

    @PostMapping("/{id}/prerequisites")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ModuleResponseDto>> addPrerequisite(
            @PathVariable UUID id,
            @Valid @RequestBody PrerequisiteLinkRequestDto linkDto
    ) {
        ModuleResponseDto response = moduleService.addPrerequisite(id, linkDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Prerequisite added to module successfully"));
    }

    @DeleteMapping("/{id}/prerequisites/{prereqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ModuleResponseDto>> removePrerequisite(
            @PathVariable UUID id,
            @PathVariable UUID prereqId
    ) {
        ModuleResponseDto response = moduleService.removePrerequisite(id, prereqId);
        return ResponseEntity.ok(ApiResponse.success(response, "Prerequisite removed from module successfully"));
    }
}
