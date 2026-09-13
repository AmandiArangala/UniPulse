package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.admin.DataAuditAnomalyDto;
import com.unipulse.unipulse_backend.dto.admin.DataAuditSummaryDto;
import com.unipulse.unipulse_backend.dto.admin.ResolveAnomalyRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataAuditService {

    private final Map<UUID, DataAuditAnomalyDto> anomaliesStore = new ConcurrentHashMap<>();

    public DataAuditSummaryDto getAuditSummary() {
        if (anomaliesStore.isEmpty()) {
            seedDefaultAnomalies();
        }

        List<DataAuditAnomalyDto> openList = anomaliesStore.values().stream()
                .filter(a -> !"RESOLVED".equalsIgnoreCase(a.getStatus()) && !"DISMISSED".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.toList());

        int missingMarks = (int) openList.stream().filter(a -> "MISSING_MARKS".equalsIgnoreCase(a.getAnomalyType())).count();
        int incompleteEnrollments = (int) openList.stream().filter(a -> "INCOMPLETE_ENROLLMENT".equalsIgnoreCase(a.getAnomalyType())).count();
        int orphanedRecords = (int) openList.stream().filter(a -> "ORPHANED_RECORD".equalsIgnoreCase(a.getAnomalyType())).count();
        int unassignedModules = (int) openList.stream().filter(a -> "UNASSIGNED_MODULE".equalsIgnoreCase(a.getAnomalyType())).count();

        int total = openList.size();
        double score = Math.max(0.0, Math.min(100.0, 100.0 - (total * 2.5)));

        return DataAuditSummaryDto.builder()
                .totalAnomalies(total)
                .missingMarksCount(missingMarks)
                .incompleteEnrollmentsCount(incompleteEnrollments)
                .orphanedRecordsCount(orphanedRecords)
                .unassignedModulesCount(unassignedModules)
                .dataIntegrityScore(Math.round(score * 10.0) / 10.0)
                .recentAnomalies(openList.stream().limit(5).collect(Collectors.toList()))
                .build();
    }

    public List<DataAuditAnomalyDto> getAnomalies(String type, String severity, String search) {
        if (anomaliesStore.isEmpty()) {
            seedDefaultAnomalies();
        }

        return anomaliesStore.values().stream()
                .filter(a -> type == null || type.equalsIgnoreCase("ALL") || type.equalsIgnoreCase(a.getAnomalyType()))
                .filter(a -> severity == null || severity.equalsIgnoreCase("ALL") || severity.equalsIgnoreCase(a.getSeverity()))
                .filter(a -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase();
                    return a.getTitle().toLowerCase().contains(q)
                            || a.getAffectedName().toLowerCase().contains(q)
                            || a.getDescription().toLowerCase().contains(q);
                })
                .sorted(Comparator.comparing(DataAuditAnomalyDto::getDetectedAt).reversed())
                .collect(Collectors.toList());
    }

    public DataAuditAnomalyDto resolveAnomaly(UUID id, ResolveAnomalyRequestDto request) {
        DataAuditAnomalyDto anomaly = anomaliesStore.get(id);
        if (anomaly == null) {
            throw new IllegalArgumentException("Audit anomaly record with ID " + id + " not found.");
        }

        if ("DISMISS".equalsIgnoreCase(request.getAction())) {
            anomaly.setStatus("DISMISSED");
        } else {
            anomaly.setStatus("RESOLVED");
        }

        anomaly.setResolvedAt(OffsetDateTime.now());
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            anomaly.setDescription(anomaly.getDescription() + " | Resolution note: " + request.getNotes());
        }

        log.info("Data Audit anomaly {} resolved with action: {}", id, request.getAction());
        return anomaly;
    }

    private synchronized void seedDefaultAnomalies() {
        if (!anomaliesStore.isEmpty()) return;

        List<DataAuditAnomalyDto> initial = List.of(
                DataAuditAnomalyDto.builder()
                        .id(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                        .title("Unsubmitted Midterm Marks for CS-301")
                        .anomalyType("MISSING_MARKS")
                        .severity("HIGH")
                        .entityType("Assessment")
                        .entityId("assg-301")
                        .affectedName("CS-301 Data Structures Midterm")
                        .departmentName("Computer Science")
                        .description("48 student mark sheets are pending lecturer approval past deadline (overdue by 4 days).")
                        .recommendedAction("Notify lecturer Prof. Marcus Brody to upload final score CSV.")
                        .status("OPEN")
                        .detectedAt(OffsetDateTime.now().minusDays(2))
                        .build(),
                DataAuditAnomalyDto.builder()
                        .id(UUID.fromString("22222222-2222-2222-2222-222222222222"))
                        .title("Orphaned Module Enrollment Record")
                        .anomalyType("ORPHANED_RECORD")
                        .severity("MEDIUM")
                        .entityType("ModuleEnrollment")
                        .entityId("enr-8901")
                        .affectedName("Student #stu-409 (Withdrawn)")
                        .departmentName("Electrical Engineering")
                        .description("Active enrollment record exists for student who was withdrawn from department.")
                        .recommendedAction("Purge orphaned record or reassign to general elective catalog.")
                        .status("OPEN")
                        .detectedAt(OffsetDateTime.now().minusDays(1))
                        .build(),
                DataAuditAnomalyDto.builder()
                        .id(UUID.fromString("33333333-3333-3333-3333-333333333333"))
                        .title("Incomplete Student Degree Registration")
                        .anomalyType("INCOMPLETE_ENROLLMENT")
                        .severity("HIGH")
                        .entityType("Student")
                        .entityId("stu-104")
                        .affectedName("Sophia Martinez")
                        .departmentName("Computer Science")
                        .description("Student enrolled in semester without mandatory Core CS-101 course declaration.")
                        .recommendedAction("Repair enrollment state by registering missing prerequisite module.")
                        .status("OPEN")
                        .detectedAt(OffsetDateTime.now().minusHours(12))
                        .build(),
                DataAuditAnomalyDto.builder()
                        .id(UUID.fromString("44444444-4444-4444-4444-444444444444"))
                        .title("Unassigned Module Lecturer Coordinator")
                        .anomalyType("UNASSIGNED_MODULE")
                        .severity("LOW")
                        .entityType("Module")
                        .entityId("mod-ee-204")
                        .affectedName("EE-204 Circuit Analysis II")
                        .departmentName("Electrical Engineering")
                        .description("Course module active for Fall 2026 term has no primary lecturer assigned.")
                        .recommendedAction("Assign module lecturer coordinator via Academic Catalog Manager.")
                        .status("OPEN")
                        .detectedAt(OffsetDateTime.now().minusDays(3))
                        .build()
        );

        for (DataAuditAnomalyDto item : initial) {
            anomaliesStore.put(item.getId(), item);
        }
    }
}
