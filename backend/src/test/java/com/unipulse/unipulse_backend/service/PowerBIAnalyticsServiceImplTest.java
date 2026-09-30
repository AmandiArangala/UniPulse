package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.analytics.DAXMeasureDto;
import com.unipulse.unipulse_backend.dto.analytics.PowerBISemanticModelDto;
import com.unipulse.unipulse_backend.dto.analytics.StarSchemaRelationshipDto;
import com.unipulse.unipulse_backend.repository.DataWarehouseRepository;
import com.unipulse.unipulse_backend.service.impl.PowerBIAnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PowerBIAnalyticsServiceImplTest {

    @Mock
    private DataWarehouseRepository dataWarehouseRepository;

    @InjectMocks
    private PowerBIAnalyticsServiceImpl powerBIAnalyticsService;

    private Map<String, Object> mockMetrics;

    @BeforeEach
    void setUp() {
        mockMetrics = new HashMap<>();
        mockMetrics.put("avg_gpa", new BigDecimal("3.45"));
        mockMetrics.put("pass_rate_pct", new BigDecimal("89.20"));
        mockMetrics.put("attendance_pct", new BigDecimal("86.50"));
        mockMetrics.put("high_risk_count", 12L);
        mockMetrics.put("intervention_success_rate_pct", new BigDecimal("78.50"));
        mockMetrics.put("pearson_correlation_r", new BigDecimal("0.8120"));
        mockMetrics.put("academic_health_index", new BigDecimal("84.30"));
        mockMetrics.put("critical_student_count", 4L);
        mockMetrics.put("submission_rate_pct", new BigDecimal("90.40"));
    }

    @Test
    @DisplayName("Should generate complete Power BI Semantic Model DTO")
    void getSemanticModel_Success() {
        when(dataWarehouseRepository.fetchDAXSummaryMetrics(anyString(), anyString())).thenReturn(mockMetrics);
        when(dataWarehouseRepository.fetchFactPerformanceCount()).thenReturn(1500L);

        PowerBISemanticModelDto model = powerBIAnalyticsService.getSemanticModel("Semester 1", "Engineering");

        assertThat(model).isNotNull();
        assertThat(model.getModelName()).contains("UniPulse Enterprise Semantic Model");
        assertThat(model.getTotalFactRecords()).isEqualTo(1500L);
        assertThat(model.getDaxMeasures()).hasSizeGreaterThanOrEqualTo(7);
        assertThat(model.getRelationships()).hasSize(5);
        assertThat(model.getDimensionTables()).contains("dim_student", "dim_module", "dim_semester");
    }

    @Test
    @DisplayName("Should calculate exact DAX measures list with formulas and status indicators")
    void getDAXMeasures_Success() {
        when(dataWarehouseRepository.fetchDAXSummaryMetrics(anyString(), anyString())).thenReturn(mockMetrics);

        List<DAXMeasureDto> measures = powerBIAnalyticsService.getDAXMeasures("ALL", "ALL");

        assertThat(measures).isNotNull();
        assertThat(measures).isNotEmpty();

        DAXMeasureDto avgGpa = measures.stream()
                .filter(m -> "avg_gpa".equals(m.getMeasureKey()))
                .findFirst()
                .orElse(null);

        assertThat(avgGpa).isNotNull();
        assertThat(avgGpa.getName()).isEqualTo("[Avg GPA]");
        assertThat(avgGpa.getCalculatedValue()).isEqualTo(new BigDecimal("3.45"));
        assertThat(avgGpa.getDaxFormula()).isEqualTo("AVERAGE('dim_student'[current_gpa])");

        DAXMeasureDto passRate = measures.stream()
                .filter(m -> "pass_rate_pct".equals(m.getMeasureKey()))
                .findFirst()
                .orElse(null);

        assertThat(passRate).isNotNull();
        assertThat(passRate.getName()).isEqualTo("[Pass Rate %]");
        assertThat(passRate.getCalculatedValue()).isEqualTo(new BigDecimal("89.20"));
    }

    @Test
    @DisplayName("Should return 5 single-directional 1-to-many Star Schema relationships")
    void getStarSchemaRelationships_Success() {
        List<StarSchemaRelationshipDto> relationships = powerBIAnalyticsService.getStarSchemaRelationships();

        assertThat(relationships).hasSize(5);
        assertThat(relationships).allMatch(r -> "ONE_TO_MANY".equals(r.getCardinality()));
        assertThat(relationships).allMatch(r -> "SINGLE_DIRECTIONAL".equals(r.getFilterDirection()));
    }
}
