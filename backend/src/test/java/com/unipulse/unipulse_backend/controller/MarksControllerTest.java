package com.unipulse.unipulse_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unipulse.unipulse_backend.dto.assessment.*;
import com.unipulse.unipulse_backend.exception.GlobalExceptionHandler;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import com.unipulse.unipulse_backend.service.MarksRecordingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.InputStream;
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
class MarksControllerTest {

    @Mock
    private MarksRecordingService marksRecordingService;

    @Mock
    private GpaCalculationService gpaCalculationService;

    @InjectMocks
    private MarksController marksController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UUID assessmentId;
    private UUID studentId;
    private AssessmentResultResponseDto resultDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(marksController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        assessmentId = UUID.randomUUID();
        studentId = UUID.randomUUID();

        resultDto = AssessmentResultResponseDto.builder()
                .id(UUID.randomUUID())
                .assessmentId(assessmentId)
                .assessmentTitle("Midterm Exam")
                .studentId(studentId)
                .studentNumber("IT21001234")
                .studentName("John Doe")
                .scoreObtained(new BigDecimal("85.00"))
                .maxScore(new BigDecimal("100.00"))
                .percentageScore(new BigDecimal("85.00"))
                .isLate(false)
                .feedback("Excellent work")
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/assessments/{assessmentId}/marks - Should record single mark and return 201 Created")
    void recordSingleMark_Success() throws Exception {
        MarkEntryRequestDto requestDto = MarkEntryRequestDto.builder()
                .studentId(studentId)
                .scoreObtained(new BigDecimal("85.00"))
                .isLate(false)
                .feedback("Excellent work")
                .build();

        when(marksRecordingService.recordSingleMark(eq(assessmentId), any(MarkEntryRequestDto.class))).thenReturn(resultDto);

        mockMvc.perform(post("/api/v1/assessments/{assessmentId}/marks", assessmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Assessment mark recorded successfully")))
                .andExpect(jsonPath("$.data.scoreObtained", is(85.00)));
    }

    @Test
    @DisplayName("POST /api/v1/assessments/{assessmentId}/marks/batch - Should record batch marks and return 200 OK")
    void recordBatchMarks_Success() throws Exception {
        MarkEntryRequestDto requestDto = MarkEntryRequestDto.builder()
                .studentId(studentId)
                .scoreObtained(new BigDecimal("85.00"))
                .build();

        BatchMarkEntryRequestDto batchRequest = BatchMarkEntryRequestDto.builder()
                .assessmentId(assessmentId)
                .marks(List.of(requestDto))
                .build();


        BatchMarkImportResultDto importResult = BatchMarkImportResultDto.builder()
                .assessmentId(assessmentId)
                .totalProcessed(1)
                .successCount(1)
                .failureCount(0)
                .recordedResults(List.of(resultDto))
                .build();

        when(marksRecordingService.recordBatchMarks(eq(assessmentId), any(BatchMarkEntryRequestDto.class))).thenReturn(importResult);

        mockMvc.perform(post("/api/v1/assessments/{assessmentId}/marks/batch", assessmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.successCount", is(1)));
    }

    @Test
    @DisplayName("POST /api/v1/assessments/{assessmentId}/marks/upload - Should process CSV upload and return 200 OK")
    void uploadCsvMarks_Success() throws Exception {
        String csvContent = "studentNumber,scoreObtained,isLate,feedback\nIT21001234,85.00,false,Excellent work\n";
        MockMultipartFile file = new MockMultipartFile("file", "marks.csv", "text/csv", csvContent.getBytes());

        BatchMarkImportResultDto importResult = BatchMarkImportResultDto.builder()
                .assessmentId(assessmentId)
                .totalProcessed(1)
                .successCount(1)
                .failureCount(0)
                .recordedResults(List.of(resultDto))
                .build();

        when(marksRecordingService.recordCsvBatchMarks(eq(assessmentId), any(InputStream.class))).thenReturn(importResult);

        mockMvc.perform(multipart("/api/v1/assessments/{assessmentId}/marks/upload", assessmentId)
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("CSV marks spreadsheet imported successfully")));
    }

    @Test
    @DisplayName("GET /api/v1/assessments/{assessmentId}/analytics - Should return 200 OK with analytics data")
    void getAssessmentAnalytics_Success() throws Exception {
        AssessmentAnalyticsDto analyticsDto = AssessmentAnalyticsDto.builder()
                .assessmentId(assessmentId)
                .assessmentTitle("Midterm Exam")
                .totalSubmissions(10)
                .meanScore(new BigDecimal("78.50"))
                .medianScore(new BigDecimal("80.00"))
                .highestScore(new BigDecimal("95.00"))
                .lowestScore(new BigDecimal("50.00"))
                .standardDeviation(new BigDecimal("12.30"))
                .passRatePercentage(new BigDecimal("90.00"))
                .build();

        when(gpaCalculationService.computeAssessmentAnalytics(assessmentId)).thenReturn(analyticsDto);

        mockMvc.perform(get("/api/v1/assessments/{assessmentId}/analytics", assessmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalSubmissions", is(10)))
                .andExpect(jsonPath("$.data.meanScore", is(78.50)));
    }
}
