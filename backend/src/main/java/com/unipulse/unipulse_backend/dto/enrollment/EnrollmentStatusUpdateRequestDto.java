package com.unipulse.unipulse_backend.dto.enrollment;

import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentStatusUpdateRequestDto {

    @NotNull(message = "Enrollment status is required")
    private EnrollmentStatus status;

    private BigDecimal finalGrade;

    private String letterGrade;
}
