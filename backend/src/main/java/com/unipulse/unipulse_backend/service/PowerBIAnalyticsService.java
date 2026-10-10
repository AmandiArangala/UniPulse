package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.analytics.DAXMeasureDto;
import com.unipulse.unipulse_backend.dto.analytics.PowerBISemanticModelDto;
import com.unipulse.unipulse_backend.dto.analytics.StarSchemaRelationshipDto;

import java.util.List;

public interface PowerBIAnalyticsService {
    PowerBISemanticModelDto getSemanticModel(String semesterName, String facultyName);
    List<DAXMeasureDto> getDAXMeasures(String semesterName, String facultyName);
    List<StarSchemaRelationshipDto> getStarSchemaRelationships();
}
