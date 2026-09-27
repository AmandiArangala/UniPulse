package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttentionTriggerDetailDto {

    private String ruleCode;
    private String ruleName;
    private boolean triggered;
    private int pointsAssigned;
    private int maxPoints;
    private String thresholdDescription;
    private String actualValue;
    private String diagnosticExplanation;
    private String recommendedAction;
}
