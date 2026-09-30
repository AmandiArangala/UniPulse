package com.unipulse.unipulse_backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StarSchemaRelationshipDto {
    private String id;
    private String fromTable;
    private String fromColumn;
    private String toTable;
    private String toColumn;
    private String cardinality; // e.g. "ONE_TO_MANY"
    private String filterDirection; // e.g. "SINGLE_DIRECTIONAL"
    private boolean isActive;
    private String description;
}
