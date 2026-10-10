package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.analytics.DAXMeasureDto;
import com.unipulse.unipulse_backend.dto.analytics.PowerBISemanticModelDto;
import com.unipulse.unipulse_backend.dto.analytics.StarSchemaRelationshipDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.service.PowerBIAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics/powerbi")
@RequiredArgsConstructor
public class PowerBIAnalyticsController {

    private final PowerBIAnalyticsService powerBIAnalyticsService;

    @GetMapping("/semantic-model")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER')")
    public ResponseEntity<ApiResponse<PowerBISemanticModelDto>> getSemanticModel(
            @RequestParam(required = false, defaultValue = "ALL") String semester,
            @RequestParam(required = false, defaultValue = "ALL") String faculty) {
        PowerBISemanticModelDto model = powerBIAnalyticsService.getSemanticModel(semester, faculty);
        return ResponseEntity.ok(ApiResponse.success(model, "Power BI semantic model retrieved successfully"));
    }

    @GetMapping("/dax-measures")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<DAXMeasureDto>>> getDAXMeasures(
            @RequestParam(required = false, defaultValue = "ALL") String semester,
            @RequestParam(required = false, defaultValue = "ALL") String faculty) {
        List<DAXMeasureDto> measures = powerBIAnalyticsService.getDAXMeasures(semester, faculty);
        return ResponseEntity.ok(ApiResponse.success(measures, "DAX measures library retrieved successfully"));
    }

    @GetMapping("/star-schema")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<StarSchemaRelationshipDto>>> getStarSchemaRelationships() {
        List<StarSchemaRelationshipDto> relationships = powerBIAnalyticsService.getStarSchemaRelationships();
        return ResponseEntity.ok(ApiResponse.success(relationships, "Star schema relationships retrieved successfully"));
    }
}
