package com.unipulse.unipulse_backend.dto.advisor;

import com.unipulse.unipulse_backend.model.enums.InterventionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateInterventionStatusDto {

    @NotNull(message = "Status is required")
    private InterventionStatus status;

    private String notes;

    private String followUpDate;
}
