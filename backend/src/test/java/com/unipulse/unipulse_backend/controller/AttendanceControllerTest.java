package com.unipulse.unipulse_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.unipulse.unipulse_backend.dto.attendance.*;
import com.unipulse.unipulse_backend.exception.GlobalExceptionHandler;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;
import com.unipulse.unipulse_backend.service.AttendanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AttendanceControllerTest {

    @Mock
    private AttendanceService attendanceService;

    @InjectMocks
    private AttendanceController attendanceController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UUID moduleId;
    private UUID lecturerId;
    private UUID studentId;
    private UUID sessionId;
    private AttendanceSessionResponseDto sessionResponseDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(attendanceController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        moduleId = UUID.randomUUID();
        lecturerId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        sessionId = UUID.randomUUID();

        sessionResponseDto = AttendanceSessionResponseDto.builder()
                .id(sessionId)
                .moduleId(moduleId)
                .moduleCode("CS101")
                .moduleName("Software Engineering")
                .lecturerId(lecturerId)
                .lecturerName("Dr. Alan Turing")
                .sessionDate(LocalDate.now())
                .topic("Clean Architecture")
                .totalRecords(0)
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/attendance/sessions - Should create attendance session and return 201 Created")
    void createSession_Success() throws Exception {
        AttendanceSessionRequestDto request = AttendanceSessionRequestDto.builder()
                .moduleId(moduleId)
                .lecturerId(lecturerId)
                .sessionDate(LocalDate.now())
                .topic("Clean Architecture")
                .build();

        when(attendanceService.createSession(any(AttendanceSessionRequestDto.class))).thenReturn(sessionResponseDto);

        mockMvc.perform(post("/api/v1/attendance/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Attendance session created successfully")))
                .andExpect(jsonPath("$.data.id", is(sessionId.toString())))
                .andExpect(jsonPath("$.data.moduleCode", is("CS101")));
    }

    @Test
    @DisplayName("GET /api/v1/attendance/sessions/{sessionId} - Should return session details")
    void getSessionById_Success() throws Exception {
        when(attendanceService.getSessionById(sessionId)).thenReturn(sessionResponseDto);

        mockMvc.perform(get("/api/v1/attendance/sessions/{sessionId}", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(sessionId.toString())));
    }

    @Test
    @DisplayName("POST /api/v1/attendance/records/bulk - Should record bulk attendance and return 201 Created")
    void recordBulkAttendance_Success() throws Exception {
        BulkAttendanceRecordRequestDto bulkRequest = BulkAttendanceRecordRequestDto.builder()
                .sessionId(sessionId)
                .records(List.of(
                        AttendanceRecordEntryDto.builder()
                                .studentId(studentId)
                                .status(AttendanceStatus.PRESENT)
                                .remarks("Punctual")
                                .build()
                ))
                .build();

        AttendanceRecordResponseDto recordResponse = AttendanceRecordResponseDto.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .studentId(studentId)
                .studentRegistrationNumber("STU99")
                .studentName("Alice Bob")
                .status(AttendanceStatus.PRESENT)
                .remarks("Punctual")
                .build();

        when(attendanceService.recordBulkAttendance(any(BulkAttendanceRecordRequestDto.class))).thenReturn(List.of(recordResponse));

        mockMvc.perform(post("/api/v1/attendance/records/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].status", is("PRESENT")));
    }

    @Test
    @DisplayName("GET /api/v1/attendance/summary/student/{studentId}/module/{moduleId} - Should return attendance summary")
    void getStudentAttendanceSummary_Success() throws Exception {
        AttendanceSummaryDto summaryDto = AttendanceSummaryDto.builder()
                .studentId(studentId)
                .studentRegistrationNumber("STU99")
                .studentName("Alice Bob")
                .moduleId(moduleId)
                .moduleCode("CS101")
                .totalSessions(10)
                .presentCount(9)
                .absentCount(1)
                .lateCount(0)
                .excusedCount(0)
                .attendancePercentage(90.0)
                .eligibleForExam(true)
                .statusMessage("Student meets attendance requirements (>= 80%)")
                .build();

        when(attendanceService.calculateStudentAttendanceSummary(studentId, moduleId)).thenReturn(summaryDto);

        mockMvc.perform(get("/api/v1/attendance/summary/student/{studentId}/module/{moduleId}", studentId, moduleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.attendancePercentage", is(90.0)))
                .andExpect(jsonPath("$.data.eligibleForExam", is(true)));
    }

    @Test
    @DisplayName("GET /api/v1/attendance/analytics/module/{moduleId} - Should return module attendance analytics")
    void getModuleAttendanceAnalytics_Success() throws Exception {
        ModuleAttendanceAnalyticsDto analyticsDto = ModuleAttendanceAnalyticsDto.builder()
                .moduleId(moduleId)
                .moduleCode("CS101")
                .moduleName("Software Engineering")
                .totalSessions(10)
                .totalStudentsEnrolled(25)
                .totalRecords(250)
                .presentCount(220)
                .absentCount(20)
                .lateCount(10)
                .excusedCount(0)
                .averageAttendancePercentage(89.5)
                .lowAttendanceStudentsCount(2)
                .build();

        when(attendanceService.calculateModuleAttendanceAnalytics(moduleId)).thenReturn(analyticsDto);

        mockMvc.perform(get("/api/v1/attendance/analytics/module/{moduleId}", moduleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.averageAttendancePercentage", is(89.5)))
                .andExpect(jsonPath("$.data.lowAttendanceStudentsCount", is(2)));
    }

    @Test
    @DisplayName("GET /api/v1/attendance/sessions/{sessionId} - Should return 404 Not Found when session does not exist")
    void getSessionById_NotFound_Returns404() throws Exception {
        when(attendanceService.getSessionById(sessionId))
                .thenThrow(new ResourceNotFoundException("AttendanceSession", "id", sessionId.toString()));

        mockMvc.perform(get("/api/v1/attendance/sessions/{sessionId}", sessionId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")));
    }
}
