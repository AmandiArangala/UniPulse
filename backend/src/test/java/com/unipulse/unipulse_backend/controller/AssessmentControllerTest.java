package com.unipulse.unipulse_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unipulse.unipulse_backend.dto.assessment.*;
import com.unipulse.unipulse_backend.exception.GlobalExceptionHandler;
import com.unipulse.unipulse_backend.exception.InvalidAssessmentWeightException;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import com.unipulse.unipulse_backend.service.AssessmentService;
import com.unipulse.unipulse_backend.service.AssessmentWeightValidationService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AssessmentControllerTest {

    @Mock
    private AssessmentService assessmentService;

    @Mock
    private AssessmentWeightValidationService weightValidationService;

    @InjectMocks
    private AssessmentController assessmentController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UUID moduleId;
    private UUID semesterId;
    private UUID assessmentId;
    private AssessmentResponseDto responseDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(assessmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        moduleId = UUID.randomUUID();
        semesterId = UUID.randomUUID();
        assessmentId = UUID.randomUUID();

        responseDto = AssessmentResponseDto.builder()
                .id(assessmentId)
                .moduleId(moduleId)
                .moduleCode("CS101")
                .moduleTitle("Object-Oriented Programming")
                .semesterId(semesterId)
                .semesterName("Fall 2026")
                .title("Midterm Exam")
                .type(AssessmentType.MIDTERM)
                .weightPercentage(new BigDecimal("40.00"))
                .maxScore(new BigDecimal("100.00"))
                .isPublished(false)
                .topics(List.of())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/assessments - Should create assessment and return 201 Created")
    void createAssessment_Success() throws Exception {
        AssessmentRequestDto requestDto = AssessmentRequestDto.builder()
                .moduleId(moduleId)
                .semesterId(semesterId)
                .title("Midterm Exam")
                .type(AssessmentType.MIDTERM)
                .weightPercentage(new BigDecimal("40.00"))
                .maxScore(new BigDecimal("100.00"))
                .build();

        when(assessmentService.createAssessment(any(AssessmentRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Assessment created successfully")))
                .andExpect(jsonPath("$.data.id", is(assessmentId.toString())))
                .andExpect(jsonPath("$.data.title", is("Midterm Exam")));
    }

    @Test
    @DisplayName("GET /api/v1/assessments/{id} - Should return assessment by ID and 200 OK")
    void getAssessmentById_Success() throws Exception {
        when(assessmentService.getAssessmentById(assessmentId)).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/assessments/{id}", assessmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(assessmentId.toString())));
    }

    @Test
    @DisplayName("GET /api/v1/assessments/module/{moduleId}/semester/{semesterId}/weight-summary - Should return 200 OK with summary")
    void getWeightSummary_Success() throws Exception {
        AssessmentWeightSummaryDto summaryDto = AssessmentWeightSummaryDto.builder()
                .moduleId(moduleId)
                .moduleCode("CS101")
                .semesterId(semesterId)
                .totalWeightPercentage(new BigDecimal("100.00"))
                .remainingWeightPercentage(BigDecimal.ZERO)
                .isBalanced(true)
                .isOverAllocated(false)
                .totalAssessmentsCount(2)
                .build();

        when(weightValidationService.getWeightSummary(moduleId, semesterId)).thenReturn(summaryDto);

        mockMvc.perform(get("/api/v1/assessments/module/{moduleId}/semester/{semesterId}/weight-summary", moduleId, semesterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.isBalanced", is(true)))
                .andExpect(jsonPath("$.data.totalAssessmentsCount", is(2)));
    }

    @Test
    @DisplayName("POST /api/v1/assessments/module/{moduleId}/semester/{semesterId}/publish - Should publish and return 200 OK")
    void publishAssessmentStructure_Success() throws Exception {
        when(assessmentService.publishAssessmentStructure(moduleId, semesterId)).thenReturn(List.of(responseDto));

        mockMvc.perform(post("/api/v1/assessments/module/{moduleId}/semester/{semesterId}/publish", moduleId, semesterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Module assessment structure published successfully")));
    }

    @Test
    @DisplayName("POST /api/v1/assessments/{id}/topics - Should add topic tag and return 201 Created")
    void addTopicToAssessment_Success() throws Exception {
        AssessmentTopicRequestDto topicRequest = AssessmentTopicRequestDto.builder()
                .topicName("Polymorphism")
                .weightContribution(new BigDecimal("10.00"))
                .description("Object-oriented topics")
                .build();

        AssessmentTopicResponseDto topicResponse = AssessmentTopicResponseDto.builder()
                .id(UUID.randomUUID())
                .assessmentId(assessmentId)
                .topicName("Polymorphism")
                .weightContribution(new BigDecimal("10.00"))
                .description("Object-oriented topics")
                .build();

        when(assessmentService.addTopicToAssessment(eq(assessmentId), any(AssessmentTopicRequestDto.class)))
                .thenReturn(topicResponse);

        mockMvc.perform(post("/api/v1/assessments/{id}/topics", assessmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topicRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.topicName", is("Polymorphism")));
    }

    @Test
    @DisplayName("GET /api/v1/assessments/module/{moduleId}/semester/{semesterId}/diagnostic - Should return 200 OK with topic report")
    void getTopicDiagnosticReport_Success() throws Exception {
        TopicCoverageReportDto reportDto = TopicCoverageReportDto.builder()
                .moduleId(moduleId)
                .moduleCode("CS101")
                .semesterId(semesterId)
                .totalTopicsCount(1)
                .topics(List.of(TopicDiagnosticSummaryDto.builder()
                        .topicName("Polymorphism")
                        .assessmentCount(1)
                        .totalTopicWeight(new BigDecimal("10.00"))
                        .assessmentTitles(List.of("Midterm Exam"))
                        .build()))
                .build();

        when(assessmentService.getTopicDiagnosticReport(moduleId, semesterId)).thenReturn(reportDto);

        mockMvc.perform(get("/api/v1/assessments/module/{moduleId}/semester/{semesterId}/diagnostic", moduleId, semesterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalTopicsCount", is(1)));
    }

    @Test
    @DisplayName("POST /api/v1/assessments - Should return 422 Unprocessable Entity when weight validation fails")
    void createAssessment_InvalidWeight_ReturnsUnprocessableEntity() throws Exception {
        AssessmentRequestDto requestDto = AssessmentRequestDto.builder()
                .moduleId(moduleId)
                .semesterId(semesterId)
                .title("Overweight Exam")
                .type(AssessmentType.FINAL)
                .weightPercentage(new BigDecimal("80.00"))
                .maxScore(new BigDecimal("100.00"))
                .build();

        when(assessmentService.createAssessment(any(AssessmentRequestDto.class)))
                .thenThrow(new InvalidAssessmentWeightException("Adding assessment weight exceeds 100% total module cap"));

        mockMvc.perform(post("/api/v1/assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status", is(422)))
                .andExpect(jsonPath("$.error", is("Invalid Assessment Weight")));
    }
}
