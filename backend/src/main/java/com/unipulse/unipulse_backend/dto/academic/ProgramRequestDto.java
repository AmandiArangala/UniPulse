package com.unipulse.unipulse_backend.dto.academic;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramRequestDto {

    @NotNull(message = "Department ID is required")
    private UUID departmentId;

    @NotBlank(message = "Program code is required")
    @Size(max = 20, message = "Program code must not exceed 20 characters")
    private String code;

    @NotBlank(message = "Program name is required")
    @Size(max = 150, message = "Program name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Degree level is required")
    @Size(max = 50, message = "Degree level must not exceed 50 characters")
    private String degreeLevel;

    @NotNull(message = "Total credits is required")
    @Min(value = 1, message = "Total credits must be at least 1")
    private Integer totalCredits;
}
