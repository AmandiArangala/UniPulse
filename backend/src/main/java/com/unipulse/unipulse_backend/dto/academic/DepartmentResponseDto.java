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
public class DepartmentResponseDto {

    private UUID id;
    private UUID facultyId;
    private String facultyName;
    private String facultyCode;
    private String code;
    private String name;
    private Long programCount;
    private Long moduleCount;
    private OffsetDateTime createdAt;
}
