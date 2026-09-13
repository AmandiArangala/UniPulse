package com.unipulse.unipulse_backend.dto.admin;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataAuditSummaryDto {

    private int totalAnomalies;
    private int missingMarksCount;
    private int incompleteEnrollmentsCount;
    private int orphanedRecordsCount;
    private int unassignedModulesCount;
    private double dataIntegrityScore; // Percentage 0-100%
    private List<DataAuditAnomalyDto> recentAnomalies;
}
