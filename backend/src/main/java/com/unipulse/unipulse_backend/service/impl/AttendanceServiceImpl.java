package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.attendance.*;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.AttendanceRecord;
import com.unipulse.unipulse_backend.model.entity.AttendanceSession;
import com.unipulse.unipulse_backend.model.entity.Lecturer;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Student;
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
        // Will be extended in Commit 7
        return new ArrayList<>();
    }

    @Override
    @Transactional
    public AttendanceRecordResponseDto updateAttendanceRecord(UUID recordId, AttendanceStatus status, String remarks) {
        // Will be extended in Commit 7
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSummaryDto calculateStudentAttendanceSummary(UUID studentId, UUID moduleId) {
        // Will be extended in Commit 7
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleAttendanceAnalyticsDto calculateModuleAttendanceAnalytics(UUID moduleId) {
        // Will be extended in Commit 7
        return null;
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
