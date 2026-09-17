package com.unipulse.unipulse_backend.analytics.service;

import com.unipulse.unipulse_backend.analytics.dto.AtRiskStudentOlapDto;
import com.unipulse.unipulse_backend.analytics.dto.ProgramPerformanceSummaryDto;
import com.unipulse.unipulse_backend.analytics.dto.WarehouseSummaryDto;
import com.unipulse.unipulse_backend.analytics.repository.FactPerformanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Service
public class AnalyticsWarehouseService {

    private final FactPerformanceRepository factPerformanceRepository;

    public AnalyticsWarehouseService(FactPerformanceRepository factPerformanceRepository) {
        this.factPerformanceRepository = factPerformanceRepository;
    }

    @Transactional(readOnly = true)
    public WarehouseSummaryDto getWarehouseSummary() {
        long totalFacts = factPerformanceRepository.count();
        long totalStudents = factPerformanceRepository.countTotalStudents();
        long totalModules = factPerformanceRepository.countTotalModules();
        long totalSemesters = factPerformanceRepository.countTotalSemesters();
        long totalPrograms = factPerformanceRepository.countTotalPrograms();

        BigDecimal avgHealth = defaultIfNull(factPerformanceRepository.getAverageHealthScore(), 80.00);
        BigDecimal avgAttendance = defaultIfNull(factPerformanceRepository.getAverageAttendanceRate(), 85.00);
        BigDecimal avgScores = defaultIfNull(factPerformanceRepository.getAverageAssessmentScore(), 72.00);
        BigDecimal avgSubmissions = defaultIfNull(factPerformanceRepository.getAverageSubmissionRate(), 90.00);
        BigDecimal avgEngagement = defaultIfNull(factPerformanceRepository.getAverageEngagementScore(), 78.00);

        List<Map<String, Object>> rawCounts = factPerformanceRepository.countByAttentionLevelNative();
        Map<String, Long> attentionLevelCounts = new HashMap<>();
        attentionLevelCounts.put("EXCELLENT", 0L);
        attentionLevelCounts.put("SATISFACTORY", 0L);
        attentionLevelCounts.put("ATTENTION_REQUIRED", 0L);
        attentionLevelCounts.put("CRITICAL", 0L);

        for (Map<String, Object> row : rawCounts) {
            String level = (String) row.get("level");
            Number cnt = (Number) row.get("cnt");
            if (level != null && cnt != null) {
                attentionLevelCounts.put(level, cnt.longValue());
            }
        }

        return new WarehouseSummaryDto(
                totalFacts,
                totalStudents,
                totalModules,
                totalSemesters,
                totalPrograms,
                avgHealth,
                avgAttendance,
                avgScores,
                avgSubmissions,
                avgEngagement,
                attentionLevelCounts
        );
    }

    @Transactional(readOnly = true)
    public List<AtRiskStudentOlapDto> getAtRiskStudentsOlap() {
        List<Map<String, Object>> rows = factPerformanceRepository.findAtRiskStudentsNative();
        List<AtRiskStudentOlapDto> list = new ArrayList<>();

        for (Map<String, Object> r : rows) {
            AtRiskStudentOlapDto dto = new AtRiskStudentOlapDto();
            dto.setFactId((UUID) r.get("fact_id"));
            dto.setStudentKey((UUID) r.get("student_key"));
            dto.setStudentNumber((String) r.get("student_number"));
            dto.setStudentName((String) r.get("student_name"));
            dto.setStudentEmail((String) r.get("student_email"));
            dto.setProgramCode((String) r.get("program_code"));
            dto.setProgramName((String) r.get("program_name"));
            dto.setModuleCode((String) r.get("module_code"));
            dto.setModuleTitle((String) r.get("module_title"));
            dto.setSemesterName((String) r.get("semester_name"));
            dto.setAcademicYear(r.get("academic_year") != null ? ((Number) r.get("academic_year")).intValue() : 2026);
            dto.setAssessmentAvg(toBigDecimal(r.get("assessment_avg")));
            dto.setAttendanceRate(toBigDecimal(r.get("attendance_rate")));
            dto.setSubmissionRate(toBigDecimal(r.get("submission_rate")));
            dto.setEngagementScore(toBigDecimal(r.get("engagement_score")));
            dto.setHealthScore(toBigDecimal(r.get("health_score")));
            dto.setAttentionLevel((String) r.get("attention_level"));

            Object calcAt = r.get("calculated_at");
            if (calcAt instanceof Timestamp) {
                dto.setCalculatedAt(((Timestamp) calcAt).toInstant().atOffset(ZoneOffset.UTC));
            } else if (calcAt instanceof OffsetDateTime) {
                dto.setCalculatedAt((OffsetDateTime) calcAt);
            } else {
                dto.setCalculatedAt(OffsetDateTime.now());
            }

            list.add(dto);
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<ProgramPerformanceSummaryDto> getProgramPerformanceSummary() {
        List<Map<String, Object>> rows = factPerformanceRepository.findProgramPerformanceSummaryNative();
        List<ProgramPerformanceSummaryDto> list = new ArrayList<>();

        for (Map<String, Object> r : rows) {
            ProgramPerformanceSummaryDto dto = new ProgramPerformanceSummaryDto();
            dto.setProgramCode((String) r.get("program_code"));
            dto.setProgramName((String) r.get("program_name"));
            dto.setDegreeLevel((String) r.get("degree_level"));
            dto.setFacultyName((String) r.get("faculty_name"));
            dto.setSemesterName((String) r.get("semester_name"));
            dto.setAcademicYear(r.get("academic_year") != null ? ((Number) r.get("academic_year")).intValue() : 2026);
            dto.setTotalEnrolledStudents(r.get("total_enrolled_students") != null ? ((Number) r.get("total_enrolled_students")).longValue() : 0L);
            dto.setTotalModulesTaught(r.get("total_modules_taught") != null ? ((Number) r.get("total_modules_taught")).longValue() : 0L);
            dto.setAvgAssessmentScore(toBigDecimal(r.get("avg_assessment_score")));
            dto.setAvgAttendanceRate(toBigDecimal(r.get("avg_attendance_rate")));
            dto.setAvgSubmissionRate(toBigDecimal(r.get("avg_submission_rate")));
            dto.setAvgEngagementScore(toBigDecimal(r.get("avg_engagement_score")));
            dto.setAvgAcademicHealthScore(toBigDecimal(r.get("avg_academic_health_score")));
            dto.setCriticalStudentsCount(r.get("critical_students_count") != null ? ((Number) r.get("critical_students_count")).longValue() : 0L);
            dto.setAttentionRequiredStudentsCount(r.get("attention_required_students_count") != null ? ((Number) r.get("attention_required_students_count")).longValue() : 0L);
            dto.setExcellentStudentsCount(r.get("excellent_students_count") != null ? ((Number) r.get("excellent_students_count")).longValue() : 0L);

            list.add(dto);
        }

        return list;
    }

    private BigDecimal defaultIfNull(BigDecimal val, double fallback) {
        return val != null ? val.setScale(2, RoundingMode.HALF_UP) : BigDecimal.valueOf(fallback);
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal) return ((BigDecimal) obj).setScale(2, RoundingMode.HALF_UP);
        if (obj instanceof Number) return BigDecimal.valueOf(((Number) obj).doubleValue()).setScale(2, RoundingMode.HALF_UP);
        return BigDecimal.ZERO;
    }
}
