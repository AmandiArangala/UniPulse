package com.unipulse.unipulse_backend.model.enums;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public enum AcademicDegreeClass {
    FIRST_CLASS("First Class", new BigDecimal("3.70")),
    SECOND_CLASS_UPPER("Second Class – Upper Division", new BigDecimal("3.30")),
    SECOND_CLASS_LOWER("Second Class – Lower Division", new BigDecimal("3.00")),
    PASS("Pass", new BigDecimal("2.00")),
    ACADEMIC_PROBATION("Academic Probation", BigDecimal.ZERO);

    private final String displayName;
    private final BigDecimal minCgpa;

    AcademicDegreeClass(String displayName, BigDecimal minCgpa) {
        this.displayName = displayName;
        this.minCgpa = minCgpa;
    }

    public static AcademicDegreeClass fromCgpa(BigDecimal cgpa) {
        if (cgpa == null) {
            return ACADEMIC_PROBATION;
        }

        if (cgpa.compareTo(FIRST_CLASS.minCgpa) >= 0) {
            return FIRST_CLASS;
        } else if (cgpa.compareTo(SECOND_CLASS_UPPER.minCgpa) >= 0) {
            return SECOND_CLASS_UPPER;
        } else if (cgpa.compareTo(SECOND_CLASS_LOWER.minCgpa) >= 0) {
            return SECOND_CLASS_LOWER;
        } else if (cgpa.compareTo(PASS.minCgpa) >= 0) {
            return PASS;
        } else {
            return ACADEMIC_PROBATION;
        }
    }
}
