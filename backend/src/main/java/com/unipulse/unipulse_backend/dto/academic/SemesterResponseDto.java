package com.unipulse.unipulse_backend.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemesterResponseDto {

    private UUID id;
    private String name;
    private Integer academicYear;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
    private Long activeEnrollmentCount;
}
