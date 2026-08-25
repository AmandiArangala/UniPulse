package com.unipulse.unipulse_backend.dto.academic;

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
public class DepartmentRequestDto {

    @NotNull(message = "Faculty ID is required")
    private UUID facultyId;

    @NotBlank(message = "Department code is required")
    @Size(max = 20, message = "Department code must not exceed 20 characters")
    private String code;

    @NotBlank(message = "Department name is required")
    @Size(max = 150, message = "Department name must not exceed 150 characters")
    private String name;
}
