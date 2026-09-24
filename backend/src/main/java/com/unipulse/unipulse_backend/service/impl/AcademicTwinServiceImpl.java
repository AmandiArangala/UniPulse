package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.AcademicTwinDto;
import com.unipulse.unipulse_backend.dto.student.HealthScoreBreakdownDto;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.AcademicTwinService;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AcademicTwinServiceImpl implements AcademicTwinService {

    private final StudentRepository studentRepository;
    private final GpaCalculationService gpaCalculationService;

    // Multi-factor Health Score Weights
    private static final BigDecimal WEIGHT_PERF = new BigDecimal("0.40");
    private static final BigDecimal WEIGHT_ATTN = new BigDecimal("0.20");
    private static final BigDecimal WEIGHT_SUBM = new BigDecimal("0.15");
    private static final BigDecimal WEIGHT_ENGAGE = new BigDecimal("0.15");
    private static final BigDecimal WEIGHT_TREND = new BigDecimal("0.10");

    @Override
    @Transactional(readOnly = true)
    public AcademicTwinDto getAcademicTwinForStudent(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        BigDecimal cgpa = student.getGpa() != null ? student.getGpa() : new BigDecimal("3.42");
        BigDecimal attendanceRate = new BigDecimal("84.00");
        BigDecimal assessmentAvg = new BigDecimal("76.00");
        BigDecimal submissionRate = new BigDecimal("92.00");
        BigDecimal engagementScore = new BigDecimal("71.00");
        String trendSlope = "IMPROVING";

        return buildTwinDto(student, cgpa, attendanceRate, assessmentAvg, submissionRate, engagementScore, trendSlope);
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicTwinDto calculateCustomAcademicTwin(
            UUID studentId,
            BigDecimal customAttn,
            BigDecimal customSubm,
            BigDecimal customEngage,
            BigDecimal customPerf
    ) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        BigDecimal cgpa = student.getGpa() != null ? student.getGpa() : new BigDecimal("3.42");
        BigDecimal attendanceRate = customAttn != null ? customAttn : new BigDecimal("84.00");
        BigDecimal submissionRate = customSubm != null ? customSubm : new BigDecimal("92.00");
        BigDecimal engagementScore = customEngage != null ? customEngage : new BigDecimal("71.00");
        BigDecimal assessmentAvg = customPerf != null ? customPerf : new BigDecimal("76.00");
        String trendSlope = "IMPROVING";

        return buildTwinDto(student, cgpa, attendanceRate, assessmentAvg, submissionRate, engagementScore, trendSlope);
    }

    private AcademicTwinDto buildTwinDto(
            Student student,
            BigDecimal cgpa,
            BigDecimal attendanceRate,
            BigDecimal assessmentAvg,
            BigDecimal submissionRate,
            BigDecimal engagementScore,
            String trendSlope
    ) {
        // Academic Performance Score: (GPA / 4.0 * 100 * 0.5) + (AssessmentAvg * 0.5)
        BigDecimal gpaPercent = cgpa.divide(new BigDecimal("4.00"), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        BigDecimal academicPerfScore = gpaPercent.multiply(new BigDecimal("0.5"))
                .add(assessmentAvg.multiply(new BigDecimal("0.5")))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal trendScore = "IMPROVING".equalsIgnoreCase(trendSlope) ? new BigDecimal("95.00")
                : "STABLE".equalsIgnoreCase(trendSlope) ? new BigDecimal("75.00")
                : new BigDecimal("45.00");

        BigDecimal perfContrib = academicPerfScore.multiply(WEIGHT_PERF).setScale(2, RoundingMode.HALF_UP);
        BigDecimal attnContrib = attendanceRate.multiply(WEIGHT_ATTN).setScale(2, RoundingMode.HALF_UP);
        BigDecimal submContrib = submissionRate.multiply(WEIGHT_SUBM).setScale(2, RoundingMode.HALF_UP);
        BigDecimal engageContrib = engagementScore.multiply(WEIGHT_ENGAGE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal trendContrib = trendScore.multiply(WEIGHT_TREND).setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalHealthScore = perfContrib.add(attnContrib).add(submContrib).add(engageContrib).add(trendContrib)
                .setScale(2, RoundingMode.HALF_UP);

        String statusTier;
        if (totalHealthScore.compareTo(new BigDecimal("85.00")) >= 0) {
            statusTier = "EXCELLENT";
        } else if (totalHealthScore.compareTo(new BigDecimal("70.00")) >= 0) {
            statusTier = "HEALTHY";
        } else if (totalHealthScore.compareTo(new BigDecimal("50.00")) >= 0) {
            statusTier = "ATTENTION";
        } else {
            statusTier = "CRITICAL";
        }

        HealthScoreBreakdownDto breakdown = HealthScoreBreakdownDto.builder()
                .academicPerformanceScore(academicPerfScore)
                .academicPerformanceWeight(WEIGHT_PERF)
                .academicPerformanceContribution(perfContrib)
                .attendanceScore(attendanceRate)
                .attendanceWeight(WEIGHT_ATTN)
                .attendanceContribution(attnContrib)
                .submissionScore(submissionRate)
                .submissionWeight(WEIGHT_SUBM)
                .submissionContribution(submContrib)
                .engagementScore(engagementScore)
                .engagementWeight(WEIGHT_ENGAGE)
                .engagementContribution(engageContrib)
                .trendScore(trendScore)
                .trendWeight(WEIGHT_TREND)
                .trendContribution(trendContrib)
                .totalHealthScore(totalHealthScore)
                .statusTier(statusTier)
                .trendSlope(trendSlope)
                .formulaDescription("Health = (Perf*0.40) + (Attn*0.20) + (Subm*0.15) + (Engage*0.15) + (Trend*0.10)")
                .build();

        List<String> recommendations = generateRecommendations(statusTier, attendanceRate, submissionRate, engagementScore, assessmentAvg);

        String studentName = (student.getUser() != null) ? student.getUser().getFirstName() + " " + student.getUser().getLastName() : "Alex Mercer";
        String programName = (student.getProgram() != null) ? student.getProgram().getName() : "BSc Computer Science & Data Analytics";
        Integer totalCreditsReq = (student.getProgram() != null && student.getProgram().getTotalCredits() != null) ? student.getProgram().getTotalCredits() : 120;
        Integer creditsDone = student.getCurrentSemester() != null ? student.getCurrentSemester() * 16 : 64;

        return AcademicTwinDto.builder()
                .studentId(student.getUserId())
                .studentNumber(student.getStudentNumber())
                .studentName(studentName)
                .programName(programName)
                .currentCgpa(cgpa)
                .creditsCompleted(creditsDone)
                .totalCreditsRequired(totalCreditsReq)
                .attendanceRate(attendanceRate)
                .assessmentAvg(assessmentAvg)
                .submissionRate(submissionRate)
                .engagementScore(engagementScore)
                .trendSlope(trendSlope)
                .healthScore(totalHealthScore)
                .statusTier(statusTier)
                .healthBreakdown(breakdown)
                .recommendations(recommendations)
                .lastUpdated(OffsetDateTime.now())
                .build();
    }

    private List<String> generateRecommendations(
            String statusTier,
            BigDecimal attendance,
            BigDecimal submission,
            BigDecimal engagement,
            BigDecimal assessment
    ) {
        List<String> recs = new ArrayList<>();
        if (attendance.compareTo(new BigDecimal("80.00")) < 0) {
            recs.add("Attendance is below target threshold (80%). Attend upcoming interactive lectures to avoid risk.");
        }
        if (submission.compareTo(new BigDecimal("85.00")) < 0) {
            recs.add("Ensure all assessment coursework is submitted prior to deadline dates.");
        }
        if (engagement.compareTo(new BigDecimal("75.00")) < 0) {
            recs.add("Increase engagement on LMS portal resources and discussion boards.");
        }
        if (assessment.compareTo(new BigDecimal("70.00")) < 0) {
            recs.add("Schedule a consultation session with academic advisor or course lecturer.");
        }
        if (recs.isEmpty()) {
            recs.add("Maintain current study cadence and performance trajectory for First Class honors eligibility.");
        }
        return recs;
    }
}
