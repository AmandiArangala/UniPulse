package com.unipulse.unipulse_backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DAXMeasureDto {
    private String measureKey;
    private String name;
    private String daxFormula;
    private BigDecimal calculatedValue;
    private String unit;
    private String category;
    private String description;
    private String sqlEquivalent;
    private BigDecimal varianceFromTarget;
    private String statusIndicator;
}
