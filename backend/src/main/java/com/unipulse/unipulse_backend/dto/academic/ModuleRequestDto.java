package com.unipulse.unipulse_backend.dto.academic;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleRequestDto {

    @NotNull(message = "Department ID is required")
    private UUID departmentId;

    @NotBlank(message = "Module code is required")
    @Size(max = 20, message = "Module code must not exceed 20 characters")
    private String code;

    @NotBlank(message = "Module title is required")
    @Size(max = 150, message = "Module title must not exceed 150 characters")
    private String title;

    @NotNull(message = "Credit hours is required")
    @Min(value = 1, message = "Credit hours must be at least 1")
    private Integer creditHours;

    private String description;

    private Set<PrerequisiteLinkRequestDto> prerequisites;
}
