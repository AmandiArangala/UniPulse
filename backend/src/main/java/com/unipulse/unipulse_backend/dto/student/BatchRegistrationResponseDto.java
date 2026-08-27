package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchRegistrationResponseDto {

    private int totalProcessed;
    private int successCount;
    private int failureCount;

    @Builder.Default
    private List<String> errors = new ArrayList<>();

    @Builder.Default
    private List<StudentProgramResponseDto> registeredStudents = new ArrayList<>();
}
