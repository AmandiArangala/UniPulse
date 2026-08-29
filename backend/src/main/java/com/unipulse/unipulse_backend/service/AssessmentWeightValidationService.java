package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentWeightSummaryDto;

import java.math.BigDecimal;
import java.util.UUID;

public interface AssessmentWeightValidationService {

    BigDecimal calculateTotalWeight(UUID moduleId, UUID semesterId);

    void validateWeightCap(UUID moduleId, UUID semesterId, BigDecimal newWeight, UUID excludeAssessmentId);

    AssessmentWeightSummaryDto getWeightSummary(UUID moduleId, UUID semesterId);

    boolean isWeightBalanced(UUID moduleId, UUID semesterId);

    void verifyFullBalanceForPublishing(UUID moduleId, UUID semesterId);
}
