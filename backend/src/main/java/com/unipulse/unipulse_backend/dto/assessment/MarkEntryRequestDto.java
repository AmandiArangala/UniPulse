package com.unipulse.unipulse_backend.dto.assessment;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkEntryRequestDto {

    private UUID studentId;

    private String studentNumber;

    @NotNull(message = "Score obtained is required")
    @DecimalMin(value = "0.00", message = "Score obtained cannot be negative")
    @DecimalMax(value = "100.00", message = "Score obtained cannot exceed 100.00")
    private BigDecimal scoreObtained;

    @Builder.Default
    private Boolean isLate = false;

    private String feedback;
}
