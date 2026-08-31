package com.unipulse.unipulse_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.unipulse.unipulse_backend.dto.event.*;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.LearningEvent;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.entity.User;
import com.unipulse.unipulse_backend.repository.LearningEventRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.impl.LearningEventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LearningEventServiceImplTest {

    @Mock
    private LearningEventRepository learningEventRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @InjectMocks
    private LearningEventServiceImpl learningEventService;

    private UUID studentId;
    private UUID moduleId;
    private UUID eventId;
    private Student student;
    private Module module;
    private User studentUser;
    private LearningEvent event;
    private ObjectNode payload;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        eventId = UUID.randomUUID();

        studentUser = User.builder()
                .id(studentId)
                .firstName("Bob")
                .lastName("Jones")
                .build();

        student = Student.builder()
                .userId(studentId)
                .user(studentUser)
                .studentNumber("STU2002")
                .build();

        module = Module.builder()
                .id(moduleId)
                .code("SE201")
                .title("Database Systems")
                .build();

        ObjectMapper mapper = new ObjectMapper();
        payload = mapper.createObjectNode();
        payload.put("video_id", "v-12345");
        payload.put("watch_duration_seconds", 340);

        event = LearningEvent.builder()
                .id(eventId)
                .student(student)
                .module(module)
                .eventType("VIDEO_WATCHED")
                .eventSource("LMS_PORTAL")
                .timestamp(LocalDateTime.now())
                .payload(payload)
                .build();
    }

    @Test
    @DisplayName("Should ingest learning event with JSONB payload successfully")
    void ingestEvent_Success() {
        LearningEventIngestRequestDto request = LearningEventIngestRequestDto.builder()
                .studentId(studentId)
                .moduleId(moduleId)
                .eventType("VIDEO_WATCHED")
                .eventSource("LMS_PORTAL")
                .timestamp(LocalDateTime.now())
                .payload(payload)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(learningEventRepository.save(any(LearningEvent.class))).thenReturn(event);

        LearningEventResponseDto response = learningEventService.ingestEvent(request);

        assertThat(response).isNotNull();
        assertThat(response.getEventType()).isEqualTo("VIDEO_WATCHED");
        assertThat(response.getPayload().get("video_id").asText()).isEqualTo("v-12345");
        verify(learningEventRepository, times(1)).save(any(LearningEvent.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when student ID is invalid during ingestion")
    void ingestEvent_StudentNotFound_ThrowsException() {
        LearningEventIngestRequestDto request = LearningEventIngestRequestDto.builder()
                .studentId(studentId)
                .moduleId(moduleId)
                .eventType("VIDEO_WATCHED")
                .eventSource("LMS_PORTAL")
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> learningEventService.ingestEvent(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should calculate student LMS event analytics and engagement level correctly")
    void getStudentEventAnalytics_Success() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(learningEventRepository.countByStudentUserIdAndModuleId(studentId, moduleId)).thenReturn(16L);

        List<Object[]> mockCounts = List.of(
                new Object[]{"VIDEO_WATCHED", 10L},
                new Object[]{"QUIZ_SUBMITTED", 6L}
        );
        when(learningEventRepository.countEventTypesByStudentAndModule(studentId, moduleId)).thenReturn(mockCounts);
        when(learningEventRepository.findTopByStudentUserIdAndModuleIdOrderByTimestampDesc(studentId, moduleId)).thenReturn(Optional.of(event));

        LearningEventAnalyticsDto analytics = learningEventService.getStudentEventAnalytics(studentId, moduleId);

        assertThat(analytics).isNotNull();
        assertThat(analytics.getTotalEventsLogged()).isEqualTo(16L);
        assertThat(analytics.getEngagementLevel()).isEqualTo("HIGH");
        assertThat(analytics.getEventTypeCounts()).containsEntry("VIDEO_WATCHED", 10L);
    }
}
