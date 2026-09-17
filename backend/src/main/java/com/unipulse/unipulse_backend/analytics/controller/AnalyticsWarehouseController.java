package com.unipulse.unipulse_backend.analytics.controller;

import com.unipulse.unipulse_backend.analytics.dto.AtRiskStudentOlapDto;
import com.unipulse.unipulse_backend.analytics.dto.ProgramPerformanceSummaryDto;
import com.unipulse.unipulse_backend.analytics.dto.WarehouseSummaryDto;
import com.unipulse.unipulse_backend.analytics.service.AnalyticsWarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics/warehouse")
@CrossOrigin(origins = "*")
public class AnalyticsWarehouseController {

    private final AnalyticsWarehouseService analyticsWarehouseService;

    public AnalyticsWarehouseController(AnalyticsWarehouseService analyticsWarehouseService) {
        this.analyticsWarehouseService = analyticsWarehouseService;
    }

    @GetMapping("/summary")
    public ResponseEntity<WarehouseSummaryDto> getWarehouseSummary() {
        WarehouseSummaryDto summary = analyticsWarehouseService.getWarehouseSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/at-risk")
    public ResponseEntity<List<AtRiskStudentOlapDto>> getAtRiskStudentsOlap() {
        List<AtRiskStudentOlapDto> atRiskList = analyticsWarehouseService.getAtRiskStudentsOlap();
        return ResponseEntity.ok(atRiskList);
    }

    @GetMapping("/program-performance")
    public ResponseEntity<List<ProgramPerformanceSummaryDto>> getProgramPerformanceSummary() {
        List<ProgramPerformanceSummaryDto> programSummaries = analyticsWarehouseService.getProgramPerformanceSummary();
        return ResponseEntity.ok(programSummaries);
    }
}
