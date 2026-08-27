package com.unipulse.unipulse_backend.dto.student;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProgramEnrollmentRequestDto {

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Program ID is required")
    private UUID programId;

    @NotNull(message = "Enrollment year is required")
    private Integer enrollmentYear;

    @Builder.Default
    private Integer currentSemester = 1;
}
