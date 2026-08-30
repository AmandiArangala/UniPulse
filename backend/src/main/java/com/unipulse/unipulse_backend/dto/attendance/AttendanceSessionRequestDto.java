package com.unipulse.unipulse_backend.dto.attendance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSessionRequestDto {

    @NotNull(message = "Module ID is required")
    private UUID moduleId;

    @NotNull(message = "Lecturer ID is required")
    private UUID lecturerId;

    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;

    @Size(max = 150, message = "Topic must not exceed 150 characters")
    private String topic;
}
