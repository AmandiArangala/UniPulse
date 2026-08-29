package com.unipulse.unipulse_backend.util;

import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class GradeMappingUtilTest {

    @ParameterizedTest
    @DisplayName("Should correctly map raw percentages to letter grades")
    @CsvSource({
        "85.00, A+",
        "92.50, A+",
        "84.99, A",
        "75.00, A",
        "74.50, A-",
        "70.00, A-",
        "69.90, B+",
        "65.00, B+",
        "64.99, B",
        "60.00, B",
        "59.50, B-",
        "55.00, B-",
        "54.99, C+",
        "50.00, C+",
        "49.99, C",
        "45.00, C",
        "44.99, C-",
        "40.00, C-",
        "39.99, D",
        "35.00, D",
        "34.99, F",
        "12.00, F"
    })
    void shouldMapPercentageToLetterGrade(BigDecimal percentage, String expectedGrade) {
        assertEquals(expectedGrade, GradeMappingUtil.getLetterGrade(percentage));
    }

    @ParameterizedTest
    @DisplayName("Should correctly map letter grades to 4.0 grade point scale")
    @CsvSource({
        "A+, 4.00",
        "A, 4.00",
        "A-, 3.70",
        "B+, 3.30",
        "B, 3.00",
        "B-, 2.70",
        "C+, 2.30",
        "C, 2.00",
        "C-, 1.70",
        "D, 1.00",
        "F, 0.00",
        "I, 0.00"
    })
    void shouldMapLetterGradeToGradePoint(String letterGrade, BigDecimal expectedPoint) {
        assertEquals(expectedPoint, GradeMappingUtil.getGradePoint(letterGrade));
    }

    @Test
    @DisplayName("Should return null grade point for non-GPA special grades P, N, W")
    void shouldHandleNonGpaGrades() {
        assertNull(GradeMappingUtil.getGradePoint("P"));
        assertNull(GradeMappingUtil.getGradePoint("N"));
        assertNull(GradeMappingUtil.getGradePoint("W"));

        assertTrue(GradeMappingUtil.isNonGpaGrade("P"));
        assertTrue(GradeMappingUtil.isNonGpaGrade("N"));
        assertTrue(GradeMappingUtil.isNonGpaGrade("W"));
        assertFalse(GradeMappingUtil.isNonGpaGrade("A"));
    }

    @Test
    @DisplayName("Should evaluate 35% component threshold pass rule")
    void shouldCheckComponentThresholdPass() {
        assertTrue(GradeMappingUtil.checkComponentThresholdPass(new BigDecimal("35.00"), new BigDecimal("40.00")));
        assertTrue(GradeMappingUtil.checkComponentThresholdPass(new BigDecimal("80.00"), new BigDecimal("70.00")));

        assertFalse(GradeMappingUtil.checkComponentThresholdPass(new BigDecimal("34.99"), new BigDecimal("70.00")));
        assertFalse(GradeMappingUtil.checkComponentThresholdPass(new BigDecimal("50.00"), new BigDecimal("30.00")));
    }

    @Test
    @DisplayName("Should force Fail grade if component threshold is not met")
    void shouldForceFailWhenComponentThresholdViolated() {
        assertEquals("F", GradeMappingUtil.determineFinalLetterGrade(new BigDecimal("75.00"), false));
        assertEquals("A", GradeMappingUtil.determineFinalLetterGrade(new BigDecimal("75.00"), true));
    }

    @ParameterizedTest
    @DisplayName("Should map CGPA to Award of Classes enum")
    @CsvSource({
        "3.85, FIRST_CLASS",
        "3.70, FIRST_CLASS",
        "3.69, SECOND_CLASS_UPPER",
        "3.30, SECOND_CLASS_UPPER",
        "3.29, SECOND_CLASS_LOWER",
        "3.00, SECOND_CLASS_LOWER",
        "2.99, PASS",
        "2.00, PASS",
        "1.99, ACADEMIC_PROBATION",
        "0.00, ACADEMIC_PROBATION"
    })
    void shouldMapCgpaToDegreeClass(BigDecimal cgpa, AcademicDegreeClass expectedClass) {
        assertEquals(expectedClass, GradeMappingUtil.getDegreeClass(cgpa));
    }
}
