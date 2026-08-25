package com.unipulse.unipulse_backend.dto.academic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyRequestDto {

    @NotBlank(message = "Faculty code is required")
    @Size(max = 20, message = "Faculty code must not exceed 20 characters")
    private String code;

    @NotBlank(message = "Faculty name is required")
    @Size(max = 150, message = "Faculty name must not exceed 150 characters")
    private String name;

    private String description;
}
