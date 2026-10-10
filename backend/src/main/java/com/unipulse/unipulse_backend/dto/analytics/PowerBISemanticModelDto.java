package com.unipulse.unipulse_backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PowerBISemanticModelDto {
    private String modelName;
    private String targetWarehouse;
    private String databaseSchema;
    private Long totalFactRecords;
    private List<DAXMeasureDto> daxMeasures;
    private List<StarSchemaRelationshipDto> relationships;
    private List<String> dimensionTables;
    private String factTable;
    private OffsetDateTime lastRefreshedAt;
}
