package com.unipulse.unipulse_backend.dto.student;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhatIfGpaSimulationRequestDto {

    @NotEmpty(message = "Simulated assessment scores list cannot be empty")
    private List<SimulatedScoreDto> simulatedScores;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimulatedScoreDto {
        @NotNull(message = "Assessment ID is required")
        private UUID assessmentId;

        @NotNull(message = "Simulated score is required")
        @DecimalMin(value = "0.00", message = "Simulated score cannot be negative")
        @DecimalMax(value = "100.00", message = "Simulated score cannot exceed 100.00")
        private BigDecimal simulatedScore;
    }
}
