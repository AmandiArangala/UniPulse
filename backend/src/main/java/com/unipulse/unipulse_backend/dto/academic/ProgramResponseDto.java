package com.unipulse.unipulse_backend.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramResponseDto {

    private UUID id;
    private UUID departmentId;
    private String departmentName;
    private String departmentCode;
    private UUID facultyId;
    private String facultyName;
    private String code;
    private String name;
    private String degreeLevel;
    private Integer totalCredits;
    private Long studentCount;
    private OffsetDateTime createdAt;
}
