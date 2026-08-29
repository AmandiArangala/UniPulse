package com.unipulse.unipulse_backend.util;

import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class GradeMappingUtil {

    public static final BigDecimal MIN_COMPONENT_THRESHOLD = new BigDecimal("35.00");

    public static String getLetterGrade(BigDecimal percentage) {
        if (percentage == null) {
            return "I";
        }
        
        BigDecimal scaled = percentage.setScale(2, RoundingMode.HALF_UP);

        if (scaled.compareTo(new BigDecimal("85.00")) >= 0) {
            return "A+";
        } else if (scaled.compareTo(new BigDecimal("75.00")) >= 0) {
            return "A";
        } else if (scaled.compareTo(new BigDecimal("70.00")) >= 0) {
            return "A-";
        } else if (scaled.compareTo(new BigDecimal("65.00")) >= 0) {
            return "B+";
        } else if (scaled.compareTo(new BigDecimal("60.00")) >= 0) {
            return "B";
        } else if (scaled.compareTo(new BigDecimal("55.00")) >= 0) {
            return "B-";
        } else if (scaled.compareTo(new BigDecimal("50.00")) >= 0) {
            return "C+";
        } else if (scaled.compareTo(new BigDecimal("45.00")) >= 0) {
            return "C";
        } else if (scaled.compareTo(new BigDecimal("40.00")) >= 0) {
            return "C-";
        } else if (scaled.compareTo(new BigDecimal("35.00")) >= 0) {
            return "D";
        } else {
            return "F";
        }
    }

    public static BigDecimal getGradePoint(String letterGrade) {
        if (letterGrade == null) {
            return BigDecimal.ZERO;
        }

        switch (letterGrade.toUpperCase().trim()) {
            case "A+":
            case "A":
                return new BigDecimal("4.00");
            case "A-":
                return new BigDecimal("3.70");
            case "B+":
                return new BigDecimal("3.30");
            case "B":
                return new BigDecimal("3.00");
            case "B-":
                return new BigDecimal("2.70");
            case "C+":
                return new BigDecimal("2.30");
            case "C":
                return new BigDecimal("2.00");
            case "C-":
                return new BigDecimal("1.70");
            case "D":
                return new BigDecimal("1.00");
            case "F":
            case "I":
                return new BigDecimal("0.00");
            case "P":
            case "N":
            case "W":
                // Excluded from GPA calculation
                return null;
            default:
                return BigDecimal.ZERO;
        }
    }

    public static boolean isNonGpaGrade(String letterGrade) {
        if (letterGrade == null) {
            return false;
        }
        String normalized = letterGrade.toUpperCase().trim();
        return "P".equals(normalized) || "N".equals(normalized) || "W".equals(normalized);
    }

    public static boolean checkComponentThresholdPass(BigDecimal caPercentage, BigDecimal wePercentage) {
        if (caPercentage != null && caPercentage.compareTo(MIN_COMPONENT_THRESHOLD) < 0) {
            return false;
        }
        if (wePercentage != null && wePercentage.compareTo(MIN_COMPONENT_THRESHOLD) < 0) {
            return false;
        }
        return true;
    }

    public static String determineFinalLetterGrade(BigDecimal percentage, boolean meetsComponentThreshold) {
        if (!meetsComponentThreshold) {
            return "F";
        }
        return getLetterGrade(percentage);
    }

    public static AcademicDegreeClass getDegreeClass(BigDecimal cgpa) {
        return AcademicDegreeClass.fromCgpa(cgpa);
    }
}
