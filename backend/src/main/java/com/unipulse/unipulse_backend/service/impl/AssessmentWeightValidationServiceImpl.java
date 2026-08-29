package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentResponseDto;
import com.unipulse.unipulse_backend.dto.assessment.AssessmentTopicResponseDto;
import com.unipulse.unipulse_backend.dto.assessment.AssessmentWeightSummaryDto;
import com.unipulse.unipulse_backend.exception.InvalidAssessmentWeightException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Semester;
import com.unipulse.unipulse_backend.repository.AssessmentRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.SemesterRepository;
import com.unipulse.unipulse_backend.service.AssessmentWeightValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentWeightValidationServiceImpl implements AssessmentWeightValidationService {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");

    private final AssessmentRepository assessmentRepository;
    private final ModuleRepository moduleRepository;
    private final SemesterRepository semesterRepository;

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalWeight(UUID moduleId, UUID semesterId) {
        BigDecimal total = assessmentRepository.sumWeightByModuleIdAndSemesterId(moduleId, semesterId);
        return total != null ? total.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public void validateWeightCap(UUID moduleId, UUID semesterId, BigDecimal newWeight, UUID excludeAssessmentId) {
        if (newWeight == null || newWeight.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAssessmentWeightException("Assessment weight percentage must be greater than 0.00%");
        }

        BigDecimal currentTotal = excludeAssessmentId != null
                ? assessmentRepository.sumWeightByModuleIdAndSemesterIdExcludingId(moduleId, semesterId, excludeAssessmentId)
                : assessmentRepository.sumWeightByModuleIdAndSemesterId(moduleId, semesterId);

        if (currentTotal == null) {
            currentTotal = BigDecimal.ZERO;
        }

        BigDecimal projectTotal = currentTotal.add(newWeight).setScale(2, RoundingMode.HALF_UP);

        if (projectTotal.compareTo(HUNDRED) > 0) {
            BigDecimal maxAllowedRemaining = HUNDRED.subtract(currentTotal);
            if (maxAllowedRemaining.compareTo(BigDecimal.ZERO) < 0) {
                maxAllowedRemaining = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }
            throw new InvalidAssessmentWeightException(
                    String.format("Adding assessment weight of %s%% exceeds the 100.00%% total module cap. Current allocated weight: %s%%, Maximum remaining weight allowed: %s%%.",
                            newWeight.setScale(2, RoundingMode.HALF_UP),
                            currentTotal.setScale(2, RoundingMode.HALF_UP),
                            maxAllowedRemaining.setScale(2, RoundingMode.HALF_UP))
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentWeightSummaryDto getWeightSummary(UUID moduleId, UUID semesterId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + moduleId));

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + semesterId));

        List<Assessment> assessments = assessmentRepository.findByModuleIdAndSemesterId(moduleId, semesterId);

        BigDecimal totalWeight = assessments.stream()
                .map(Assessment::getWeightPercentage)
                .filter(w -> w != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal remainingWeight = HUNDRED.subtract(totalWeight);

        boolean isBalanced = totalWeight.compareTo(HUNDRED) == 0;
        boolean isOverAllocated = totalWeight.compareTo(HUNDRED) > 0;

        List<AssessmentResponseDto> assessmentDtos = assessments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return AssessmentWeightSummaryDto.builder()
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .moduleTitle(module.getTitle())
                .semesterId(semester.getId())
                .semesterName(semester.getName())
                .totalWeightPercentage(totalWeight)
                .remainingWeightPercentage(remainingWeight)
                .isBalanced(isBalanced)
                .isOverAllocated(isOverAllocated)
                .totalAssessmentsCount(assessments.size())
                .assessments(assessmentDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWeightBalanced(UUID moduleId, UUID semesterId) {
        BigDecimal total = calculateTotalWeight(moduleId, semesterId);
        return total.compareTo(HUNDRED) == 0;
    }

    @Override
    @Transactional(readOnly = true)
    public void verifyFullBalanceForPublishing(UUID moduleId, UUID semesterId) {
        BigDecimal total = calculateTotalWeight(moduleId, semesterId);
        if (total.compareTo(HUNDRED) != 0) {
            throw new InvalidAssessmentWeightException(
                    String.format("Cannot publish assessment structure. Total weight per module must equal exactly 100.00%%. Current total weight is %s%%.",
                            total.setScale(2, RoundingMode.HALF_UP))
            );
        }
    }

    private AssessmentResponseDto mapToResponseDto(Assessment assessment) {
        List<AssessmentTopicResponseDto> topicDtos = assessment.getTopics() != null
                ? assessment.getTopics().stream()
                .map(t -> AssessmentTopicResponseDto.builder()
                        .id(t.getId())
                        .assessmentId(assessment.getId())
                        .topicName(t.getTopicName())
                        .weightContribution(t.getWeightContribution())
                        .description(t.getDescription())
                        .build())
                .collect(Collectors.toList())
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
}
