package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.attendance.*;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;
import com.unipulse.unipulse_backend.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponseDto>> createSession(
            @Valid @RequestBody AttendanceSessionRequestDto request
    ) {
        AttendanceSessionResponseDto response = attendanceService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Attendance session created successfully"));
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponseDto>> getSessionById(
            @PathVariable UUID sessionId
    ) {
        AttendanceSessionResponseDto response = attendanceService.getSessionById(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Attendance session details retrieved successfully"));
    }

    @GetMapping("/sessions/module/{moduleId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceSessionResponseDto>>> getSessionsByModule(
            @PathVariable UUID moduleId
    ) {
        List<AttendanceSessionResponseDto> response = attendanceService.getSessionsByModule(moduleId);
        return ResponseEntity.ok(ApiResponse.success(response, "Module attendance sessions retrieved successfully"));
    }

    @GetMapping("/sessions/lecturer/{lecturerId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceSessionResponseDto>>> getSessionsByLecturer(
            @PathVariable UUID lecturerId
    ) {
        List<AttendanceSessionResponseDto> response = attendanceService.getSessionsByLecturer(lecturerId);
        return ResponseEntity.ok(ApiResponse.success(response, "Lecturer attendance sessions retrieved successfully"));
    }

    @PostMapping("/records/bulk")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponseDto>>> recordBulkAttendance(
            @Valid @RequestBody BulkAttendanceRecordRequestDto request
    ) {
        List<AttendanceRecordResponseDto> response = attendanceService.recordBulkAttendance(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Bulk attendance records recorded successfully"));
    }

    @PutMapping("/records/{recordId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceRecordResponseDto>> updateAttendanceRecord(
            @PathVariable UUID recordId,
            @RequestParam(required = false) AttendanceStatus status,
            @RequestParam(required = false) String remarks
    ) {
        AttendanceRecordResponseDto response = attendanceService.updateAttendanceRecord(recordId, status, remarks);
        return ResponseEntity.ok(ApiResponse.success(response, "Attendance record updated successfully"));
    }

    @GetMapping("/records/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponseDto>>> getStudentAttendanceRecords(
            @PathVariable UUID studentId,
            @RequestParam(required = false) UUID moduleId
    ) {
        List<AttendanceRecordResponseDto> response = attendanceService.getStudentAttendanceRecords(studentId, moduleId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student attendance records retrieved successfully"));
    }

    @GetMapping("/summary/student/{studentId}/module/{moduleId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getStudentAttendanceSummary(
            @PathVariable UUID studentId,
            @PathVariable UUID moduleId
    ) {
        AttendanceSummaryDto response = attendanceService.calculateStudentAttendanceSummary(studentId, moduleId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student attendance summary calculated successfully"));
    }

    @GetMapping("/analytics/module/{moduleId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ModuleAttendanceAnalyticsDto>> getModuleAttendanceAnalytics(
            @PathVariable UUID moduleId
    ) {
        ModuleAttendanceAnalyticsDto response = attendanceService.calculateModuleAttendanceAnalytics(moduleId);
        return ResponseEntity.ok(ApiResponse.success(response, "Module attendance analytics generated successfully"));
    }
}
