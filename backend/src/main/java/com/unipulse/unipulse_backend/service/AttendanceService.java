package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.attendance.*;
import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;

import java.util.List;
import java.util.UUID;

public interface AttendanceService {

    AttendanceSessionResponseDto createSession(AttendanceSessionRequestDto dto);

    AttendanceSessionResponseDto getSessionById(UUID sessionId);

    List<AttendanceSessionResponseDto> getSessionsByModule(UUID moduleId);

    List<AttendanceSessionResponseDto> getSessionsByLecturer(UUID lecturerId);

    List<AttendanceRecordResponseDto> recordBulkAttendance(BulkAttendanceRecordRequestDto dto);

    AttendanceRecordResponseDto updateAttendanceRecord(UUID recordId, AttendanceStatus status, String remarks);

    AttendanceSummaryDto calculateStudentAttendanceSummary(UUID studentId, UUID moduleId);

    ModuleAttendanceAnalyticsDto calculateModuleAttendanceAnalytics(UUID moduleId);

    List<AttendanceRecordResponseDto> getStudentAttendanceRecords(UUID studentId, UUID moduleId);
}
