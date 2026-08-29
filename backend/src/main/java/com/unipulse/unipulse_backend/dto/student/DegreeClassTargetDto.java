package com.unipulse.unipulse_backend.dto.student;

import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DegreeClassTargetDto {

    private AcademicDegreeClass degreeClass;

    private BigDecimal targetMinCgpa;

    private BigDecimal requiredRemainingSgpa;

    private Boolean isAchievable;

    private String statusMessage;
}
