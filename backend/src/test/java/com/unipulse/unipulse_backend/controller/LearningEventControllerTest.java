package com.unipulse.unipulse_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.unipulse.unipulse_backend.dto.event.*;
import com.unipulse.unipulse_backend.exception.GlobalExceptionHandler;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.service.LearningEventService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class LearningEventControllerTest {

    @Mock
    private LearningEventService learningEventService;

    @InjectMocks
    private LearningEventController learningEventController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UUID studentId;
    private UUID moduleId;
    private UUID eventId;
    private LearningEventResponseDto eventResponseDto;
    private ObjectNode payloadNode;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(learningEventController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        studentId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        eventId = UUID.randomUUID();

        payloadNode = objectMapper.createObjectNode();
        payloadNode.put("quiz_score", 95);

        eventResponseDto = LearningEventResponseDto.builder()
                .id(eventId)
                .studentId(studentId)
                .studentRegistrationNumber("STU-333")
                .studentName("Charlie Brown")
                .moduleId(moduleId)
                .moduleCode("CS202")
                .eventType("QUIZ_SUBMITTED")
                .eventSource("CANVAS_LMS")
                .timestamp(LocalDateTime.now())
                .payload(payloadNode)
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/events/learning - Should ingest event and return 201 Created")
    void ingestEvent_Success() throws Exception {
        LearningEventIngestRequestDto request = LearningEventIngestRequestDto.builder()
                .studentId(studentId)
                .moduleId(moduleId)
                .eventType("QUIZ_SUBMITTED")
                .eventSource("CANVAS_LMS")
                .timestamp(LocalDateTime.now())
                .payload(payloadNode)
                .build();

        when(learningEventService.ingestEvent(any(LearningEventIngestRequestDto.class))).thenReturn(eventResponseDto);

        mockMvc.perform(post("/api/v1/events/learning")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Learning event ingested successfully")))
                .andExpect(jsonPath("$.data.eventType", is("QUIZ_SUBMITTED")));
    }

    @Test
    @DisplayName("POST /api/v1/events/learning/batch - Should ingest batch events and return 201 Created")
    void ingestBatchEvents_Success() throws Exception {
        LearningEventBatchIngestRequestDto batchRequest = LearningEventBatchIngestRequestDto.builder()
                .events(List.of(
                        LearningEventIngestRequestDto.builder()
                                .studentId(studentId)
                                .moduleId(moduleId)
                                .eventType("QUIZ_SUBMITTED")
                                .eventSource("CANVAS_LMS")
                                .payload(payloadNode)
                                .build()
                ))
                .build();

        when(learningEventService.ingestBatchEvents(any(LearningEventBatchIngestRequestDto.class))).thenReturn(List.of(eventResponseDto));

        mockMvc.perform(post("/api/v1/events/learning/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].eventType", is("QUIZ_SUBMITTED")));
    }

    @Test
    @DisplayName("GET /api/v1/events/learning/analytics/student/{studentId}/module/{moduleId} - Should return student event analytics")
    void getStudentEventAnalytics_Success() throws Exception {
        LearningEventAnalyticsDto analyticsDto = LearningEventAnalyticsDto.builder()
                .studentId(studentId)
                .studentRegistrationNumber("STU-333")
                .studentName("Charlie Brown")
                .moduleId(moduleId)
                .moduleCode("CS202")
                .totalEventsLogged(25)
                .eventTypeCounts(Map.of("QUIZ_SUBMITTED", 10L, "LECTURE_VIEWED", 15L))
                .lastActiveTimestamp(LocalDateTime.now())
                .engagementLevel("HIGH")
                .build();

        when(learningEventService.getStudentEventAnalytics(studentId, moduleId)).thenReturn(analyticsDto);

        mockMvc.perform(get("/api/v1/events/learning/analytics/student/{studentId}/module/{moduleId}", studentId, moduleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.engagementLevel", is("HIGH")))
                .andExpect(jsonPath("$.data.totalEventsLogged", is(25)));
    }

    @Test
    @DisplayName("POST /api/v1/events/learning - Should return 404 Not Found when student does not exist")
    void ingestEvent_StudentNotFound_Returns404() throws Exception {
        LearningEventIngestRequestDto request = LearningEventIngestRequestDto.builder()
                .studentId(studentId)
                .moduleId(moduleId)
                .eventType("QUIZ_SUBMITTED")
                .eventSource("CANVAS_LMS")
                .build();

        when(learningEventService.ingestEvent(any(LearningEventIngestRequestDto.class)))
                .thenThrow(new ResourceNotFoundException("Student", "id", studentId.toString()));

        mockMvc.perform(post("/api/v1/events/learning")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")));
    }
}
