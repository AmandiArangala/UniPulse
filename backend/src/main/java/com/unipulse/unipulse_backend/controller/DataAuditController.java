package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.admin.DataAuditAnomalyDto;
import com.unipulse.unipulse_backend.dto.admin.DataAuditSummaryDto;
import com.unipulse.unipulse_backend.dto.admin.ResolveAnomalyRequestDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.service.DataAuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/data-audit")
@RequiredArgsConstructor
public class DataAuditController {

    private final DataAuditService dataAuditService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DataAuditSummaryDto>> getAuditSummary() {
        DataAuditSummaryDto summary = dataAuditService.getAuditSummary();
        return ResponseEntity.ok(ApiResponse.success(summary, "System data audit summary retrieved successfully"));
    }

    @GetMapping("/anomalies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DataAuditAnomalyDto>>> getAnomalies(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String search
    ) {
        List<DataAuditAnomalyDto> anomalies = dataAuditService.getAnomalies(type, severity, search);
        return ResponseEntity.ok(ApiResponse.success(anomalies, "Data audit anomalies retrieved successfully"));
    }

    @PostMapping("/anomalies/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DataAuditAnomalyDto>> resolveAnomaly(
            @PathVariable UUID id,
            @Valid @RequestBody ResolveAnomalyRequestDto request
    ) {
        DataAuditAnomalyDto resolved = dataAuditService.resolveAnomaly(id, request);
        return ResponseEntity.ok(ApiResponse.success(resolved, "Data audit anomaly resolved successfully"));
    }
}
