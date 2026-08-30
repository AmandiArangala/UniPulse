package com.unipulse.unipulse_backend.dto.attendance;

import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecordEntryDto {

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    @Size(max = 255, message = "Remarks must not exceed 255 characters")
    private String remarks;
}
