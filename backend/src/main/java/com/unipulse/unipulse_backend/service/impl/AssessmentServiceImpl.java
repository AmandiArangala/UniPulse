package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.assessment.*;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.entity.AssessmentTopic;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Semester;
import com.unipulse.unipulse_backend.repository.AssessmentRepository;
import com.unipulse.unipulse_backend.repository.AssessmentTopicRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.SemesterRepository;
import com.unipulse.unipulse_backend.service.AssessmentService;
import com.unipulse.unipulse_backend.service.AssessmentWeightValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentTopicRepository assessmentTopicRepository;
    private final ModuleRepository moduleRepository;
    private final SemesterRepository semesterRepository;
    private final AssessmentWeightValidationService weightValidationService;

    @Override
    @Transactional
    public AssessmentResponseDto createAssessment(AssessmentRequestDto dto) {
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + dto.getModuleId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + dto.getSemesterId()));

        if (assessmentRepository.existsByModuleIdAndSemesterIdAndTitle(dto.getModuleId(), dto.getSemesterId(), dto.getTitle())) {
            throw new DuplicateResourceException("An assessment with title '" + dto.getTitle() + "' already exists for this module and semester.");
        }

        // Validate weight cap (100% max)
        weightValidationService.validateWeightCap(dto.getModuleId(), dto.getSemesterId(), dto.getWeightPercentage(), null);

        Assessment assessment = Assessment.builder()
                .module(module)
                .semester(semester)
                .title(dto.getTitle())
                .type(dto.getType())
                .weightPercentage(dto.getWeightPercentage())
                .maxScore(dto.getMaxScore() != null ? dto.getMaxScore() : new BigDecimal("100.00"))
                .dueDate(dto.getDueDate())
                .isPublished(false)
                .topics(new ArrayList<>())
                .build();

        if (dto.getTopics() != null && !dto.getTopics().isEmpty()) {
            List<AssessmentTopic> topics = dto.getTopics().stream()
                    .map(tDto -> AssessmentTopic.builder()
                            .assessment(assessment)
                            .topicName(tDto.getTopicName())
                            .weightContribution(tDto.getWeightContribution())
                            .description(tDto.getDescription())
                            .build())
                    .collect(Collectors.toList());
            assessment.getTopics().addAll(topics);
        }

        Assessment saved = assessmentRepository.save(assessment);
        return mapToResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentResponseDto getAssessmentById(UUID id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));
        return mapToResponseDto(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResponseDto> getAssessmentsByModuleAndSemester(UUID moduleId, UUID semesterId) {
        return assessmentRepository.findByModuleIdAndSemesterId(moduleId, semesterId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AssessmentResponseDto updateAssessment(UUID id, AssessmentRequestDto dto) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));

        if (!assessment.getTitle().equalsIgnoreCase(dto.getTitle()) &&
                assessmentRepository.existsByModuleIdAndSemesterIdAndTitle(dto.getModuleId(), dto.getSemesterId(), dto.getTitle())) {
            throw new DuplicateResourceException("An assessment with title '" + dto.getTitle() + "' already exists for this module and semester.");
        }

        // Validate weight cap excluding current assessment ID
        weightValidationService.validateWeightCap(dto.getModuleId(), dto.getSemesterId(), dto.getWeightPercentage(), id);

        assessment.setTitle(dto.getTitle());
        assessment.setType(dto.getType());
        assessment.setWeightPercentage(dto.getWeightPercentage());
        if (dto.getMaxScore() != null) {
            assessment.setMaxScore(dto.getMaxScore());
        }
        assessment.setDueDate(dto.getDueDate());

        Assessment updated = assessmentRepository.save(assessment);
        return mapToResponseDto(updated);
    }

    @Override
    @Transactional
    public void deleteAssessment(UUID id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));
        assessmentRepository.delete(assessment);
    }

    @Override
    @Transactional
    public AssessmentTopicResponseDto addTopicToAssessment(UUID assessmentId, AssessmentTopicRequestDto topicDto) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + assessmentId));

        AssessmentTopic topic = AssessmentTopic.builder()
                .assessment(assessment)
                .topicName(topicDto.getTopicName())
                .weightContribution(topicDto.getWeightContribution())
                .description(topicDto.getDescription())
                .build();

        AssessmentTopic savedTopic = assessmentTopicRepository.save(topic);
        return mapToTopicResponseDto(savedTopic);
    }

    @Override
    @Transactional
    public void removeTopicFromAssessment(UUID assessmentId, UUID topicId) {
        if (!assessmentRepository.existsById(assessmentId)) {
            throw new ResourceNotFoundException("Assessment not found with id: " + assessmentId);
        }
        AssessmentTopic topic = assessmentTopicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic tag not found with id: " + topicId));

        if (!topic.getAssessment().getId().equals(assessmentId)) {
            throw new IllegalArgumentException("Topic does not belong to the specified assessment.");
        }
        assessmentTopicRepository.delete(topic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentTopicResponseDto> getTopicsByAssessment(UUID assessmentId) {
        if (!assessmentRepository.existsById(assessmentId)) {
            throw new ResourceNotFoundException("Assessment not found with id: " + assessmentId);
        }
        return assessmentTopicRepository.findByAssessmentId(assessmentId).stream()
                .map(this::mapToTopicResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TopicCoverageReportDto getTopicDiagnosticReport(UUID moduleId, UUID semesterId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + semesterId));

        List<Assessment> assessments = assessmentRepository.findByModuleIdAndSemesterId(moduleId, semesterId);

        Map<String, List<String>> topicToTitlesMap = new LinkedHashMap<>();
        Map<String, BigDecimal> topicToWeightMap = new LinkedHashMap<>();

        for (Assessment assessment : assessments) {
            if (assessment.getTopics() != null) {
                for (AssessmentTopic topic : assessment.getTopics()) {
                    String tName = topic.getTopicName().trim();
                    topicToTitlesMap.computeIfAbsent(tName, k -> new ArrayList<>()).add(assessment.getTitle());

                    BigDecimal weightToAdd = topic.getWeightContribution() != null
                            ? topic.getWeightContribution()
                            : assessment.getWeightPercentage();

                    topicToWeightMap.put(tName, topicToWeightMap.getOrDefault(tName, BigDecimal.ZERO).add(weightToAdd));
                }
            }
        }

        List<TopicDiagnosticSummaryDto> diagnosticSummaries = topicToTitlesMap.entrySet().stream()
                .map(entry -> TopicDiagnosticSummaryDto.builder()
                        .topicName(entry.getKey())
                        .assessmentCount(entry.getValue().size())
                        .totalTopicWeight(topicToWeightMap.getOrDefault(entry.getKey(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP))
                        .assessmentTitles(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        return TopicCoverageReportDto.builder()
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .moduleTitle(module.getTitle())
                .semesterId(semester.getId())
                .semesterName(semester.getName())
                .totalTopicsCount(diagnosticSummaries.size())
                .topics(diagnosticSummaries)
                .build();
    }

    @Override
    @Transactional
    public List<AssessmentResponseDto> publishAssessmentStructure(UUID moduleId, UUID semesterId) {
        // Enforce 100% weight rule
        weightValidationService.verifyFullBalanceForPublishing(moduleId, semesterId);

        List<Assessment> assessments = assessmentRepository.findByModuleIdAndSemesterId(moduleId, semesterId);
        for (Assessment assessment : assessments) {
            assessment.setIsPublished(true);
        }

        List<Assessment> saved = assessmentRepository.saveAll(assessments);
        return saved.stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }

    private AssessmentResponseDto mapToResponseDto(Assessment assessment) {
        List<AssessmentTopicResponseDto> topicDtos = assessment.getTopics() != null
                ? assessment.getTopics().stream().map(this::mapToTopicResponseDto).collect(Collectors.toList())
                : List.of();

        return AssessmentResponseDto.builder()
                .id(assessment.getId())
                .moduleId(assessment.getModule().getId())
                .moduleCode(assessment.getModule().getCode())
                .moduleTitle(assessment.getModule().getTitle())
                .semesterId(assessment.getSemester().getId())
                .semesterName(assessment.getSemester().getName())
                .title(assessment.getTitle())
                .type(assessment.getType())
                .weightPercentage(assessment.getWeightPercentage())
                .maxScore(assessment.getMaxScore())
                .dueDate(assessment.getDueDate())
                .isPublished(assessment.getIsPublished())
                .topics(topicDtos)
                .build();
    }

    private AssessmentTopicResponseDto mapToTopicResponseDto(AssessmentTopic topic) {
        return AssessmentTopicResponseDto.builder()
                .id(topic.getId())
                .assessmentId(topic.getAssessment().getId())
                .topicName(topic.getTopicName())
                .weightContribution(topic.getWeightContribution())
                .description(topic.getDescription())
                .build();
    }
}
