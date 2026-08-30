package com.unipulse.unipulse_backend.dto.attendance;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSessionResponseDto {

    private UUID id;
    private UUID moduleId;
    private String moduleCode;
    private String moduleName;
    private UUID lecturerId;
    private String lecturerName;
    private LocalDate sessionDate;
    private String topic;
    private long totalRecords;
}
