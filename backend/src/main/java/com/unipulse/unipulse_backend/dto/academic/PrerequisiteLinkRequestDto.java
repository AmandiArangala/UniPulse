package com.unipulse.unipulse_backend.dto.academic;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrerequisiteLinkRequestDto {

    @NotNull(message = "Prerequisite module ID is required")
    private UUID prerequisiteModuleId;

    @Builder.Default
    private Boolean isMandatory = true;

    @Builder.Default
    private String minimumGrade = "C";
}
