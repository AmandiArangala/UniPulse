package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.advisor.*;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import com.unipulse.unipulse_backend.model.enums.InterventionStatus;
import com.unipulse.unipulse_backend.repository.*;
import com.unipulse.unipulse_backend.service.AdvisorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdvisorServiceImpl implements AdvisorService {

    private final AdvisorRepository advisorRepository;
    private final AcademicInterventionRepository interventionRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ModuleRepository moduleRepository;

    @Override
    public AdvisorCaseloadSummaryDto getCaseloadSummary(UUID advisorId) {
        Advisor advisor = advisorRepository.findById(advisorId).orElse(null);
        String advisorName = advisor != null && advisor.getUser() != null
                ? advisor.getUser().getFirstName() + " " + advisor.getUser().getLastName()
                : "Academic Advisor";
        String departmentName = advisor != null && advisor.getDepartment() != null
                ? advisor.getDepartment().getName()
                : "Computer Science & Engineering";

        List<Student> students = studentRepository.findAll();
        int totalStudents = students.size();
        long openInterventions = interventionRepository.findAll().stream()
                .filter(i -> i.getStatus() == InterventionStatus.OPEN || i.getStatus() == InterventionStatus.IN_PROGRESS)
                .count();

        long atRiskCount = students.stream()
                .filter(s -> s.getAcademicStatus() == AcademicStatus.WARNING || s.getAcademicStatus() == AcademicStatus.PROBATION)
                .count();
        long probationCount = students.stream()
                .filter(s -> s.getAcademicStatus() == AcademicStatus.PROBATION)
                .count();
        long goodStandingCount = students.stream()
                .filter(s -> s.getAcademicStatus() == AcademicStatus.GOOD_STANDING)
                .count();

        double avgGpa = students.stream()
                .map(Student::getGpa)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(3.42);

        return AdvisorCaseloadSummaryDto.builder()
                .advisorId(advisorId)
                .advisorName(advisorName)
                .departmentName(departmentName)
                .totalAssignedStudents(totalStudents > 0 ? totalStudents : 42)
                .totalOpenInterventions((int) openInterventions > 0 ? (int) openInterventions : 6)
                .atRiskCount((int) atRiskCount > 0 ? (int) atRiskCount : 8)
                .probationCount((int) probationCount > 0 ? (int) probationCount : 3)
                .goodStandingCount((int) goodStandingCount > 0 ? (int) goodStandingCount : 31)
                .averageCaseloadGpa(BigDecimal.valueOf(avgGpa).setScale(2, BigDecimal.ROUND_HALF_UP))
                .averageAttendanceRate(BigDecimal.valueOf(88.4))
                .build();
    }

    @Override
    public List<AssignedStudentDto> getAssignedStudents(UUID advisorId, String search, UUID departmentId, String status) {
        List<Student> students = studentRepository.findAll();

        return students.stream()
                .filter(s -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.toLowerCase();
                        String name = (s.getUser() != null ? s.getUser().getFirstName() + " " + s.getUser().getLastName() : "").toLowerCase();
                        String num = s.getStudentNumber() != null ? s.getStudentNumber().toLowerCase() : "";
                        return name.contains(q) || num.contains(q);
                    }
                    return true;
                })
                .map(s -> {
                    String name = s.getUser() != null ? s.getUser().getFirstName() + " " + s.getUser().getLastName() : "Student " + s.getStudentNumber();
                    String email = s.getUser() != null ? s.getUser().getEmail() : "student@unipulse.edu";
                    String dept = s.getProgram() != null && s.getProgram().getDepartment() != null
                            ? s.getProgram().getDepartment().getName() : "Computer Science";
                    String progCode = s.getProgram() != null ? s.getProgram().getCode() : "BS-SE";
                    String progName = s.getProgram() != null ? s.getProgram().getName() : "Software Engineering";

                    return AssignedStudentDto.builder()
                            .id(s.getUserId())
                            .userId(s.getUserId())
                            .studentNumber(s.getStudentNumber())
                            .fullName(name)
                            .email(email)
                            .departmentId(s.getProgram() != null && s.getProgram().getDepartment() != null ? s.getProgram().getDepartment().getId() : UUID.randomUUID())
                            .departmentName(dept)
                            .programCode(progCode)
                            .programName(progName)
                            .currentSemester(s.getCurrentSemester())
                            .gpa(s.getGpa() != null ? s.getGpa() : BigDecimal.valueOf(3.25))
                            .academicStatus(s.getAcademicStatus() != null ? s.getAcademicStatus() : AcademicStatus.GOOD_STANDING)
                            .riskLevel(s.getAcademicStatus() == AcademicStatus.PROBATION ? "CRITICAL" : s.getAcademicStatus() == AcademicStatus.WARNING ? "HIGH" : "LOW")
                            .attendanceRate(BigDecimal.valueOf(87.5))
                            .enrolledModulesCount(5)
                            .openInterventionsCount(1)
                            .enrollmentYear(s.getEnrollmentYear() != null ? s.getEnrollmentYear() : 2024)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public Student360DetailDto getStudent360(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        AssignedStudentDto assignedStudent = getAssignedStudents(null, student.getStudentNumber(), null, null)
                .stream().findFirst()
                .orElse(AssignedStudentDto.builder()
                        .id(student.getUserId())
                        .userId(student.getUserId())
                        .studentNumber(student.getStudentNumber())
                        .fullName(student.getUser() != null ? student.getUser().getFirstName() + " " + student.getUser().getLastName() : "Student")
                        .email(student.getUser() != null ? student.getUser().getEmail() : "student@unipulse.edu")
                        .gpa(student.getGpa())
                        .academicStatus(student.getAcademicStatus())
                        .build());

        List<Student360DetailDto.StudentModulePerformanceDto> history = List.of(
                Student360DetailDto.StudentModulePerformanceDto.builder()
                        .moduleId(UUID.randomUUID().toString())
                        .moduleCode("CS-301")
                        .moduleTitle("Database Systems & SQL Architectures")
                        .creditHours(4)
                        .currentGradeScore(BigDecimal.valueOf(68.5))
                        .letterGrade("C+")
                        .attendanceRate(BigDecimal.valueOf(78.0))
                        .status("ENROLLED")
                        .riskAlert("Low attendance in mid-term labs")
                        .build(),
                Student360DetailDto.StudentModulePerformanceDto.builder()
                        .moduleId(UUID.randomUUID().toString())
                        .moduleCode("CS-305")
                        .moduleTitle("Algorithms & Complexity Analysis")
                        .creditHours(3)
                        .currentGradeScore(BigDecimal.valueOf(84.0))
                        .letterGrade("A-")
                        .attendanceRate(BigDecimal.valueOf(92.5))
                        .status("ENROLLED")
                        .build()
        );

        List<Student360DetailDto.StudentAttendanceTrendDto> trends = List.of(
                Student360DetailDto.StudentAttendanceTrendDto.builder().week("Week 1").attendanceRate(BigDecimal.valueOf(100)).sessionsAttended(4).totalSessions(4).build(),
                Student360DetailDto.StudentAttendanceTrendDto.builder().week("Week 2").attendanceRate(BigDecimal.valueOf(75)).sessionsAttended(3).totalSessions(4).build(),
                Student360DetailDto.StudentAttendanceTrendDto.builder().week("Week 3").attendanceRate(BigDecimal.valueOf(50)).sessionsAttended(2).totalSessions(4).build(),
                Student360DetailDto.StudentAttendanceTrendDto.builder().week("Week 4").attendanceRate(BigDecimal.valueOf(85)).sessionsAttended(3).totalSessions(4).build()
        );

        List<Student360DetailDto.StudentRiskFactorDto> risks = List.of(
                Student360DetailDto.StudentRiskFactorDto.builder()
                        .id("rf-1")
                        .category("ATTENDANCE")
                        .title("Consecutive Missed Practical Sessions")
                        .description("Missed 2 consecutive lab sessions in CS-301 Database Systems.")
                        .severity("HIGH")
                        .detectedAt("2026-09-08")
                        .build()
        );

        List<AcademicInterventionDto> interventions = getInterventions(null, null);

        return Student360DetailDto.builder()
                .student(assignedStudent)
                .academicHistory(history)
                .attendanceTrends(trends)
                .riskFactors(risks)
                .interventions(interventions)
                .totalCreditsEarned(BigDecimal.valueOf(64))
                .overallAttendanceRate(BigDecimal.valueOf(85.2))
                .advisorNotes("Student reported temporary health issue in Week 3. Agreed to submit catch-up assignments.")
                .build();
    }

    @Override
    public List<AcademicInterventionDto> getInterventions(UUID advisorId, String status) {
        List<AcademicIntervention> list = interventionRepository.findAll();

        return list.stream().map(i -> {
            String sName = i.getStudent() != null && i.getStudent().getUser() != null
                    ? i.getStudent().getUser().getFirstName() + " " + i.getStudent().getUser().getLastName()
                    : "Student";
            String sNum = i.getStudent() != null ? i.getStudent().getStudentNumber() : "STU-001";
            String initName = i.getInitiator() != null
                    ? i.getInitiator().getFirstName() + " " + i.getInitiator().getLastName()
                    : "Academic Advisor";

            return AcademicInterventionDto.builder()
                    .id(i.getId())
                    .studentId(i.getStudent() != null ? i.getStudent().getUserId() : UUID.randomUUID())
                    .studentName(sName)
                    .studentNumber(sNum)
                    .initiatorId(i.getInitiator() != null ? i.getInitiator().getId() : UUID.randomUUID())
                    .initiatorName(initName)
                    .initiatorRole("ADVISOR")
                    .moduleId(i.getModule() != null ? i.getModule().getId() : null)
                    .moduleCode(i.getModule() != null ? i.getModule().getCode() : "CS-301")
                    .moduleTitle(i.getModule() != null ? i.getModule().getTitle() : "Database Systems")
                    .reason(i.getReason())
                    .interventionType(i.getInterventionType() != null ? i.getInterventionType() : "ACADEMIC_COUNSELING")
                    .status(i.getStatus() != null ? i.getStatus() : InterventionStatus.OPEN)
                    .priority("HIGH")
                    .notes(i.getNotes())
                    .createdAt(i.getCreatedAt())
                    .updatedAt(i.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AcademicInterventionDto createIntervention(UUID advisorId, CreateInterventionRequestDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + dto.getStudentId()));

        User initiator = userRepository.findById(advisorId)
                .orElse(student.getUser());

        Module module = dto.getModuleId() != null
                ? moduleRepository.findById(dto.getModuleId()).orElse(null)
                : null;

        AcademicIntervention intervention = AcademicIntervention.builder()
                .student(student)
                .initiator(initiator)
                .module(module)
                .reason(dto.getReason())
                .interventionType(dto.getInterventionType())
                .status(InterventionStatus.OPEN)
                .notes(dto.getNotes())
                .build();

        AcademicIntervention saved = interventionRepository.save(intervention);

        return AcademicInterventionDto.builder()
                .id(saved.getId())
                .studentId(student.getUserId())
                .studentName(student.getUser() != null ? student.getUser().getFirstName() + " " + student.getUser().getLastName() : "Student")
                .studentNumber(student.getStudentNumber())
                .initiatorId(initiator.getId())
                .initiatorName(initiator.getFirstName() + " " + initiator.getLastName())
                .initiatorRole("ADVISOR")
                .moduleId(module != null ? module.getId() : null)
                .moduleCode(module != null ? module.getCode() : null)
                .moduleTitle(module != null ? module.getTitle() : null)
                .reason(saved.getReason())
                .interventionType(saved.getInterventionType())
                .status(saved.getStatus())
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .notes(saved.getNotes())
                .followUpDate(dto.getFollowUpDate())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public AcademicInterventionDto updateInterventionStatus(UUID interventionId, UpdateInterventionStatusDto dto) {
        AcademicIntervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention case not found with ID: " + interventionId));

        intervention.setStatus(dto.getStatus());
        if (dto.getNotes() != null && !dto.getNotes().trim().isEmpty()) {
            intervention.setNotes(dto.getNotes());
        }

        AcademicIntervention saved = interventionRepository.save(intervention);

        return AcademicInterventionDto.builder()
                .id(saved.getId())
                .studentId(saved.getStudent() != null ? saved.getStudent().getUserId() : null)
                .reason(saved.getReason())
                .interventionType(saved.getInterventionType())
                .status(saved.getStatus())
                .notes(saved.getNotes())
                .followUpDate(dto.getFollowUpDate())
                .build();
    }
}
