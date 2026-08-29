package com.unipulse.unipulse_backend.dto.student;

import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TargetGpaProjectionDto {

    private UUID studentId;

    private BigDecimal currentCgpa;

    private AcademicDegreeClass currentDegreeClass;

    private BigDecimal earnedGpaCredits;

    private BigDecimal remainingEstimatedCredits;

    private BigDecimal maxPossibleCgpa;

    private List<DegreeClassTargetDto> targets;
}
