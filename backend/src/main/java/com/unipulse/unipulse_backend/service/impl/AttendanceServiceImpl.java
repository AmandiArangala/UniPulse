package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.attendance.*;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;
import com.unipulse.unipulse_backend.repository.*;
import com.unipulse.unipulse_backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final ModuleRepository moduleRepository;
    private final LecturerRepository lecturerRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public AttendanceSessionResponseDto createSession(AttendanceSessionRequestDto dto) {
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", dto.getModuleId().toString()));

        Lecturer lecturer = lecturerRepository.findById(dto.getLecturerId())
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer", "id", dto.getLecturerId().toString()));

        AttendanceSession session = AttendanceSession.builder()
                .module(module)
                .lecturer(lecturer)
                .sessionDate(dto.getSessionDate())
                .topic(dto.getTopic())
                .build();

        AttendanceSession savedSession = sessionRepository.save(session);
        return mapToSessionResponse(savedSession, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSessionResponseDto getSessionById(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceSession", "id", sessionId.toString()));
        long recordCount = recordRepository.findBySessionId(sessionId).size();
        return mapToSessionResponse(session, recordCount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionResponseDto> getSessionsByModule(UUID moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module", "id", moduleId.toString());
        }

        List<AttendanceSession> sessions = sessionRepository.findByModuleIdOrderBySessionDateDesc(moduleId);
        return sessions.stream()
                .map(s -> mapToSessionResponse(s, recordRepository.findBySessionId(s.getId()).size()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionResponseDto> getSessionsByLecturer(UUID lecturerId) {
        if (!lecturerRepository.existsById(lecturerId)) {
            throw new ResourceNotFoundException("Lecturer", "id", lecturerId.toString());
        }

        List<AttendanceSession> sessions = sessionRepository.findByLecturerUserId(lecturerId);
        return sessions.stream()
                .map(s -> mapToSessionResponse(s, recordRepository.findBySessionId(s.getId()).size()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceRecordResponseDto> getStudentAttendanceRecords(UUID studentId, UUID moduleId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId.toString());
        }
        if (moduleId != null && !moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module", "id", moduleId.toString());
        }

        List<AttendanceRecord> records = (moduleId != null)
                ? recordRepository.findByStudentUserIdAndSessionModuleId(studentId, moduleId)
                : recordRepository.findByStudentUserId(studentId);

        return records.stream()
                .map(this::mapToRecordResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<AttendanceRecordResponseDto> recordBulkAttendance(BulkAttendanceRecordRequestDto dto) {
        AttendanceSession session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceSession", "id", dto.getSessionId().toString()));

        List<AttendanceRecordResponseDto> responseList = new ArrayList<>();

        for (AttendanceRecordEntryDto entry : dto.getRecords()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", entry.getStudentId().toString()));

            AttendanceRecord record = recordRepository.findBySessionIdAndStudentUserId(session.getId(), student.getUserId())
                    .orElse(AttendanceRecord.builder()
                            .session(session)
                            .student(student)
                            .build());

            record.setStatus(entry.getStatus());
            record.setRemarks(entry.getRemarks());

            AttendanceRecord savedRecord = recordRepository.save(record);
            responseList.add(mapToRecordResponse(savedRecord));
        }

        return responseList;
    }

    @Override
    @Transactional
    public AttendanceRecordResponseDto updateAttendanceRecord(UUID recordId, AttendanceStatus status, String remarks) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRecord", "id", recordId.toString()));

        if (status != null) {
            record.setStatus(status);
        }
        if (remarks != null) {
            record.setRemarks(remarks);
        }

        AttendanceRecord updatedRecord = recordRepository.save(record);
        return mapToRecordResponse(updatedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSummaryDto calculateStudentAttendanceSummary(UUID studentId, UUID moduleId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId.toString()));

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId.toString()));

        long totalSessions = sessionRepository.countByModuleId(moduleId);
        long presentCount = recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.PRESENT);
        long absentCount = recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.ABSENT);
        long lateCount = recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.LATE);
        long excusedCount = recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.EXCUSED);

        double effectivePresent = presentCount + (lateCount * 0.5) + excusedCount;
        double percentage = totalSessions > 0
                ? Math.min(100.0, Math.round((effectivePresent / totalSessions) * 100.0 * 100.0) / 100.0)
                : 0.0;

        boolean eligible = percentage >= 80.0;
        String statusMsg = eligible
                ? "Student meets attendance requirements (>= 80%)"
                : "WARNING: Student attendance is below 80% threshold (Ineligible for exam)";

        String studentName = (student.getUser() != null)
                ? student.getUser().getFirstName() + " " + student.getUser().getLastName()
                : "Unknown Student";

        return AttendanceSummaryDto.builder()
                .studentId(student.getUserId())
                .studentRegistrationNumber(student.getStudentNumber())
                .studentName(studentName)
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .totalSessions(totalSessions)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .excusedCount(excusedCount)
                .attendancePercentage(percentage)
                .eligibleForExam(eligible)
                .statusMessage(statusMsg)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleAttendanceAnalyticsDto calculateModuleAttendanceAnalytics(UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId.toString()));

        long totalSessions = sessionRepository.countByModuleId(moduleId);
        List<Enrollment> enrollments = enrollmentRepository.findByModuleId(moduleId);
        long totalEnrolled = enrollments.size();

        long presentCount = recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.PRESENT);
        long absentCount = recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.ABSENT);
        long lateCount = recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.LATE);
        long excusedCount = recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.EXCUSED);
        long totalRecords = presentCount + absentCount + lateCount + excusedCount;

        long lowAttendanceStudentsCount = 0;
        double sumPercentages = 0.0;

        for (Enrollment enrollment : enrollments) {
            UUID sId = enrollment.getStudent().getUserId();
            long sPresent = recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(sId, moduleId, AttendanceStatus.PRESENT);
            long sLate = recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(sId, moduleId, AttendanceStatus.LATE);
            long sExcused = recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(sId, moduleId, AttendanceStatus.EXCUSED);

            double effPresent = sPresent + (sLate * 0.5) + sExcused;
            double sPerc = totalSessions > 0 ? Math.min(100.0, Math.round((effPresent / totalSessions) * 100.0 * 100.0) / 100.0) : 0.0;

            sumPercentages += sPerc;
            if (totalSessions > 0 && sPerc < 80.0) {
                lowAttendanceStudentsCount++;
            }
        }

        double avgPercentage = totalEnrolled > 0
                ? Math.round((sumPercentages / totalEnrolled) * 100.0) / 100.0
                : 0.0;

        return ModuleAttendanceAnalyticsDto.builder()
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .moduleName(module.getTitle())
                .totalSessions(totalSessions)
                .totalStudentsEnrolled(totalEnrolled)
                .totalRecords(totalRecords)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .excusedCount(excusedCount)
                .averageAttendancePercentage(avgPercentage)
                .lowAttendanceStudentsCount(lowAttendanceStudentsCount)
                .build();
    }

    private AttendanceSessionResponseDto mapToSessionResponse(AttendanceSession session, long totalRecords) {
        String lecturerName = (session.getLecturer() != null && session.getLecturer().getUser() != null)
                ? session.getLecturer().getUser().getFirstName() + " " + session.getLecturer().getUser().getLastName()
                : "Unknown Lecturer";

        return AttendanceSessionResponseDto.builder()
                .id(session.getId())
                .moduleId(session.getModule().getId())
                .moduleCode(session.getModule().getCode())
                .moduleName(session.getModule().getTitle())
                .lecturerId(session.getLecturer().getUserId())
                .lecturerName(lecturerName)
                .sessionDate(session.getSessionDate())
                .topic(session.getTopic())
                .totalRecords(totalRecords)
                .build();
    }

    private AttendanceRecordResponseDto mapToRecordResponse(AttendanceRecord record) {
        String studentName = (record.getStudent() != null && record.getStudent().getUser() != null)
                ? record.getStudent().getUser().getFirstName() + " " + record.getStudent().getUser().getLastName()
                : "Unknown Student";

        String studentRegNum = (record.getStudent() != null)
                ? record.getStudent().getStudentNumber()
                : "N/A";

        return AttendanceRecordResponseDto.builder()
                .id(record.getId())
                .sessionId(record.getSession().getId())
                .studentId(record.getStudent().getUserId())
                .studentRegistrationNumber(studentRegNum)
                .studentName(studentName)
                .status(record.getStatus())
                .remarks(record.getRemarks())
                .build();
    }
}
