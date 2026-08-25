package com.unipulse.unipulse_backend.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrerequisiteResponseDto {

    private UUID prerequisiteModuleId;
    private String prerequisiteModuleCode;
    private String prerequisiteModuleTitle;
    private Boolean isMandatory;
    private String minimumGrade;
}
