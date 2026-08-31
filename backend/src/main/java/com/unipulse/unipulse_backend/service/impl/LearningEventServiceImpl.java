package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.event.*;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.LearningEvent;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.repository.LearningEventRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.LearningEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningEventServiceImpl implements LearningEventService {

    private final LearningEventRepository learningEventRepository;
    private final StudentRepository studentRepository;
    private final ModuleRepository moduleRepository;

    @Override
    @Transactional
    public LearningEventResponseDto ingestEvent(LearningEventIngestRequestDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", dto.getStudentId().toString()));

        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", dto.getModuleId().toString()));

        LocalDateTime eventTimestamp = (dto.getTimestamp() != null) ? dto.getTimestamp() : LocalDateTime.now();

        LearningEvent event = LearningEvent.builder()
                .student(student)
                .module(module)
                .eventType(dto.getEventType())
                .eventSource(dto.getEventSource())
                .timestamp(eventTimestamp)
                .payload(dto.getPayload())
                .build();

        LearningEvent savedEvent = learningEventRepository.save(event);
        return mapToResponseDto(savedEvent);
    }

    @Override
    @Transactional
    public List<LearningEventResponseDto> ingestBatchEvents(LearningEventBatchIngestRequestDto dto) {
        List<LearningEventResponseDto> responseList = new ArrayList<>();
        if (dto.getEvents() != null) {
            for (LearningEventIngestRequestDto request : dto.getEvents()) {
                responseList.add(ingestEvent(request));
            }
        }
        return responseList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningEventResponseDto> getEventsByStudent(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId.toString());
        }

        return learningEventRepository.findByStudentUserIdOrderByTimestampDesc(studentId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningEventResponseDto> getEventsByModule(UUID moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module", "id", moduleId.toString());
        }

        return learningEventRepository.findByModuleIdOrderByTimestampDesc(moduleId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningEventResponseDto> getEventsByStudentAndModule(UUID studentId, UUID moduleId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId.toString());
        }
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module", "id", moduleId.toString());
        }

        return learningEventRepository.findByStudentUserIdAndModuleIdOrderByTimestampDesc(studentId, moduleId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LearningEventAnalyticsDto getStudentEventAnalytics(UUID studentId, UUID moduleId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId.toString()));

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId.toString()));

        long totalEvents = learningEventRepository.countByStudentUserIdAndModuleId(studentId, moduleId);
        List<Object[]> rawCounts = learningEventRepository.countEventTypesByStudentAndModule(studentId, moduleId);

        Map<String, Long> typeCounts = new HashMap<>();
        for (Object[] row : rawCounts) {
            String eventType = (String) row[0];
            Long count = (Long) row[1];
            typeCounts.put(eventType, count);
        }

        Optional<LearningEvent> latestEvent = learningEventRepository.findTopByStudentUserIdAndModuleIdOrderByTimestampDesc(studentId, moduleId);
        LocalDateTime lastActive = latestEvent.map(LearningEvent::getTimestamp).orElse(null);

        String engagementLevel;
        if (totalEvents >= 15) {
            engagementLevel = "HIGH";
        } else if (totalEvents >= 5) {
            engagementLevel = "MODERATE";
        } else if (totalEvents > 0) {
            engagementLevel = "LOW";
        } else {
            engagementLevel = "INACTIVE";
        }

        String studentName = (student.getUser() != null)
                ? student.getUser().getFirstName() + " " + student.getUser().getLastName()
                : "Unknown Student";

        return LearningEventAnalyticsDto.builder()
                .studentId(student.getUserId())
                .studentRegistrationNumber(student.getStudentNumber())
                .studentName(studentName)
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .totalEventsLogged(totalEvents)
                .eventTypeCounts(typeCounts)
                .lastActiveTimestamp(lastActive)
                .engagementLevel(engagementLevel)
                .build();
    }

    private LearningEventResponseDto mapToResponseDto(LearningEvent event) {
        String studentName = (event.getStudent() != null && event.getStudent().getUser() != null)
                ? event.getStudent().getUser().getFirstName() + " " + event.getStudent().getUser().getLastName()
                : "Unknown Student";

        String regNumber = (event.getStudent() != null)
                ? event.getStudent().getStudentNumber()
                : "N/A";

        String moduleCode = (event.getModule() != null)
                ? event.getModule().getCode()
                : "N/A";

        return LearningEventResponseDto.builder()
                .id(event.getId())
                .studentId(event.getStudent().getUserId())
                .studentRegistrationNumber(regNumber)
                .studentName(studentName)
                .moduleId(event.getModule().getId())
                .moduleCode(moduleCode)
                .eventType(event.getEventType())
                .eventSource(event.getEventSource())
                .timestamp(event.getTimestamp())
                .payload(event.getPayload())
                .build();
    }
}
