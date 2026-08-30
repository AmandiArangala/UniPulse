package com.unipulse.unipulse_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unipulse.unipulse_backend.dto.student.*;
import com.unipulse.unipulse_backend.exception.GlobalExceptionHandler;
import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GpaControllerTest {

    @Mock
    private GpaCalculationService gpaCalculationService;

    @InjectMocks
    private GpaController gpaController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UUID studentId;
    private UUID semesterId;
    private StudentGpaSummaryDto gpaSummaryDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(gpaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        studentId = UUID.randomUUID();
        semesterId = UUID.randomUUID();

        gpaSummaryDto = StudentGpaSummaryDto.builder()
                .studentId(studentId)
                .studentNumber("IT21001234")
                .studentName("John Doe")
                .programName("Software Engineering")
                .currentSemester(4)
                .cgpa(new BigDecimal("3.85"))
                .academicStatus(AcademicStatus.GOOD_STANDING)
                .academicDegreeClass(AcademicDegreeClass.FIRST_CLASS)
                .totalEarnedGpaCredits(new BigDecimal("60.00"))
                .totalEarnedNgpaCredits(new BigDecimal("6.00"))
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/gpa/student/{studentId} - Should return 200 OK with cumulative GPA summary")
    void getCumulativeGpaSummary_Success() throws Exception {
        when(gpaCalculationService.calculateCumulativeGpa(studentId)).thenReturn(gpaSummaryDto);

        mockMvc.perform(get("/api/v1/gpa/student/{studentId}", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.studentNumber", is("IT21001234")))
                .andExpect(jsonPath("$.data.cgpa", is(3.85)))
                .andExpect(jsonPath("$.data.academicDegreeClass", is("FIRST_CLASS")));
    }

    @Test
    @DisplayName("GET /api/v1/gpa/student/{studentId}/semester/{semesterId} - Should return 200 OK with semester SGPA report")
    void getSemesterGpaReport_Success() throws Exception {
        SemesterGpaReportDto reportDto = SemesterGpaReportDto.builder()
                .semesterId(semesterId)
                .semesterName("Fall 2026")
                .academicYear(2026)
                .sgpa(new BigDecimal("3.90"))
                .semesterGpaCredits(new BigDecimal("15.00"))
                .semesterNgpaCredits(new BigDecimal("3.00"))
                .modules(List.of())
                .build();

        when(gpaCalculationService.calculateSemesterGpa(studentId, semesterId)).thenReturn(reportDto);

        mockMvc.perform(get("/api/v1/gpa/student/{studentId}/semester/{semesterId}", studentId, semesterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.sgpa", is(3.90)));
    }

    @Test
    @DisplayName("GET /api/v1/gpa/student/{studentId}/trajectory - Should return 200 OK with honors trajectory projection")
    void getDegreeClassTrajectory_Success() throws Exception {
        TargetGpaProjectionDto projectionDto = TargetGpaProjectionDto.builder()
                .studentId(studentId)
                .currentCgpa(new BigDecimal("3.85"))
                .currentDegreeClass(AcademicDegreeClass.FIRST_CLASS)
                .earnedGpaCredits(new BigDecimal("60.00"))
                .remainingEstimatedCredits(new BigDecimal("60.00"))
                .maxPossibleCgpa(new BigDecimal("3.93"))
                .targets(List.of(DegreeClassTargetDto.builder()
                        .degreeClass(AcademicDegreeClass.FIRST_CLASS)
                        .targetMinCgpa(new BigDecimal("3.70"))
                        .requiredRemainingSgpa(new BigDecimal("3.55"))
                        .isAchievable(true)
                        .statusMessage("Requires average SGPA of 3.55 across remaining credits")
                        .build()))
                .build();

        when(gpaCalculationService.computeDegreeClassTrajectory(studentId)).thenReturn(projectionDto);

        mockMvc.perform(get("/api/v1/gpa/student/{studentId}/trajectory", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.maxPossibleCgpa", is(3.93)));
    }

    @Test
    @DisplayName("POST /api/v1/gpa/student/{studentId}/what-if - Should return 200 OK with what-if simulation response")
    void simulateWhatIfGpa_Success() throws Exception {
        WhatIfGpaSimulationRequestDto requestDto = WhatIfGpaSimulationRequestDto.builder()
                .simulatedScores(List.of(WhatIfGpaSimulationRequestDto.SimulatedScoreDto.builder()
                        .assessmentId(UUID.randomUUID())
                        .simulatedScore(new BigDecimal("90.00"))
                        .build()))
                .build();



        WhatIfGpaSimulationResponseDto responseDto = WhatIfGpaSimulationResponseDto.builder()
                .studentId(studentId)
                .currentCgpa(new BigDecimal("3.85"))
                .simulatedSgpa(new BigDecimal("3.95"))
                .simulatedCgpa(new BigDecimal("3.90"))
                .simulatedDegreeClass(AcademicDegreeClass.FIRST_CLASS)
                .gpaDelta(new BigDecimal("0.05"))
                .build();

        when(gpaCalculationService.simulateWhatIfGpa(eq(studentId), any(WhatIfGpaSimulationRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/gpa/student/{studentId}/what-if", studentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.gpaDelta", is(0.05)));
    }
}
