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
public class FacultyResponseDto {

    private UUID id;
    private String code;
    private String name;
    private String description;
    private Long departmentCount;
    private OffsetDateTime createdAt;
}
