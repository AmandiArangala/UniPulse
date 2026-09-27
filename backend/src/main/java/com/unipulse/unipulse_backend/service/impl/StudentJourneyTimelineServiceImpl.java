package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.StudentJourneyTimelineDto;
import com.unipulse.unipulse_backend.dto.student.TimelineEventDto;
import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.enums.InterventionStatus;
import com.unipulse.unipulse_backend.repository.*;
import com.unipulse.unipulse_backend.service.StudentJourneyTimelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentJourneyTimelineServiceImpl implements StudentJourneyTimelineService {

    private final StudentRepository studentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AcademicInterventionRepository academicInterventionRepository;
    private final LearningEventRepository learningEventRepository;
    private final EnrollmentRepository enrollmentRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    @Override
    public StudentJourneyTimelineDto getStudentJourneyTimeline(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        List<TimelineEventDto> events = new ArrayList<>();

        // 1. Interventions
        List<AcademicIntervention> interventions = academicInterventionRepository.findByStudentUserId(studentId);
        int openInterventionsCount = 0;
        for (AcademicIntervention i : interventions) {
            if (i.getStatus() == InterventionStatus.OPEN || i.getStatus() == InterventionStatus.IN_PROGRESS) {
                openInterventionsCount++;
            }
            String timestamp = i.getCreatedAt() != null ? i.getCreatedAt().format(ISO_FORMATTER) : "2026-09-01T00:00:00Z";
            String initiatorName = i.getInitiator() != null
                    ? (i.getInitiator().getFirstName() + " " + i.getInitiator().getLastName())
                    : "Advisor";

            Map<String, Object> meta = new HashMap<>();
            meta.put("interventionId", i.getId());
            meta.put("status", i.getStatus().name());
            meta.put("notes", i.getNotes());
            if (i.getModule() != null) {
                meta.put("moduleId", i.getModule().getId());
            }

            events.add(TimelineEventDto.builder()
                    .eventId(i.getId())
                    .category("INTERVENTION")
                    .title("Academic Support: " + i.getInterventionType().replace('_', ' '))
                    .description("Reason: " + i.getReason())
                    .timestamp(timestamp)
                    .severity(i.getStatus() == InterventionStatus.RESOLVED ? "SUCCESS" : "WARNING")
                    .moduleCode(i.getModule() != null ? i.getModule().getCode() : "GENERAL")
                    .initiatorOrSource(initiatorName)
                    .metadata(meta)
                    .build());
        }

        // 2. Assessment Results
        List<AssessmentResult> results = assessmentResultRepository.findByStudentUserId(studentId);
        for (AssessmentResult r : results) {
            if (r.getAssessment() == null) continue;
            Assessment a = r.getAssessment();
            double score = r.getScoreObtained() != null ? r.getScoreObtained().doubleValue() : 0.0;
            double maxMarks = a.getMaxScore() != null ? a.getMaxScore().doubleValue() : 100.0;
            double pct = maxMarks > 0 ? (score / maxMarks) * 100.0 : score;

            String timestamp = r.getSubmittedAt() != null ? r.getSubmittedAt().format(ISO_FORMATTER) : "2026-09-10T10:00:00Z";

            Map<String, Object> meta = new HashMap<>();
            meta.put("scoreObtained", score);
            meta.put("maxMarks", maxMarks);
            meta.put("percentage", Math.round(pct * 10.0) / 10.0);
            meta.put("remarks", r.getFeedback());

            events.add(TimelineEventDto.builder()
                    .eventId(r.getId())
                    .category("ASSESSMENT")
                    .title("Assessment Graded: " + a.getTitle())
                    .description(String.format("Score: %.1f / %.1f (%.1f%%)", score, maxMarks, pct))
                    .timestamp(timestamp)
                    .severity(pct >= 50.0 ? "SUCCESS" : "CRITICAL")
                    .moduleCode(a.getModule() != null ? a.getModule().getCode() : "N/A")
                    .initiatorOrSource("Examiner / Lecturer")
                    .metadata(meta)
                    .build());
        }

        // 3. Attendance Records
        List<AttendanceRecord> attendanceList = attendanceRecordRepository.findByStudentUserId(studentId);
        for (AttendanceRecord ar : attendanceList) {
            String timestamp = (ar.getSession() != null && ar.getSession().getSessionDate() != null)
                    ? ar.getSession().getSessionDate().toString() + "T09:00:00Z"
                    : "2026-09-05T09:00:00Z";
            String statusStr = ar.getStatus() != null ? ar.getStatus().name() : "PRESENT";
            String modCode = (ar.getSession() != null && ar.getSession().getModule() != null)
                    ? ar.getSession().getModule().getCode() : "N/A";

            Map<String, Object> meta = new HashMap<>();
            meta.put("status", statusStr);
            meta.put("remarks", ar.getRemarks());

            events.add(TimelineEventDto.builder()
                    .eventId(ar.getId())
                    .category("ATTENDANCE")
                    .title("Attendance Marked: " + statusStr)
                    .description("Class session recorded as " + statusStr.toLowerCase() + ".")
                    .timestamp(timestamp)
                    .severity(statusStr.equals("PRESENT") ? "INFO" : (statusStr.equals("LATE") ? "WARNING" : "CRITICAL"))
                    .moduleCode(modCode)
                    .initiatorOrSource("Attendance Scanner")
                    .metadata(meta)
                    .build());
        }

        // 4. Learning Events
        List<LearningEvent> learningEvents = learningEventRepository.findByStudentUserIdOrderByTimestampDesc(studentId);
        for (LearningEvent le : learningEvents) {
            String timestamp = le.getTimestamp() != null ? le.getTimestamp().format(ISO_FORMATTER) : "2026-09-12T14:00:00Z";
            String modCode = le.getModule() != null ? le.getModule().getCode() : "LMS";

            events.add(TimelineEventDto.builder()
                    .eventId(le.getId())
                    .category("LEARNING_EVENT")
                    .title("Portal Activity: " + le.getEventType().replace('_', ' '))
                    .description("Activity registered via " + le.getEventSource())
                    .timestamp(timestamp)
                    .severity("INFO")
                    .moduleCode(modCode)
                    .initiatorOrSource(le.getEventSource())
                    .metadata(new HashMap<>())
                    .build());
        }

        // 5. Enrollments
        List<Enrollment> enrollments = enrollmentRepository.findByStudentUserId(studentId);
        for (Enrollment e : enrollments) {
            String timestamp = e.getEnrolledAt() != null ? e.getEnrolledAt().format(ISO_FORMATTER) : "2026-08-25T08:00:00Z";
            String modCode = e.getModule() != null ? e.getModule().getCode() : "N/A";

            events.add(TimelineEventDto.builder()
                    .eventId(e.getId())
                    .category("ENROLLMENT")
                    .title("Module Registration: " + modCode)
                    .description("Enrollment status set to " + e.getStatus().name())
                    .timestamp(timestamp)
                    .severity("INFO")
                    .moduleCode(modCode)
                    .initiatorOrSource("Academic Registry")
                    .metadata(new HashMap<>())
                    .build());
        }

        // Sort timeline events chronologically descending (newest first)
        events.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

        String fullName = student.getUser() != null
                ? (student.getUser().getFirstName() + " " + student.getUser().getLastName())
                : "Student";
        String progCode = student.getProgram() != null ? student.getProgram().getCode() : "N/A";

        return StudentJourneyTimelineDto.builder()
                .studentId(student.getUserId())
                .studentNumber(student.getStudentNumber())
                .studentName(fullName)
                .programCode(progCode)
                .totalEventsCount(events.size())
                .openInterventionsCount(openInterventionsCount)
                .timelineEvents(events)
                .build();
    }
}
