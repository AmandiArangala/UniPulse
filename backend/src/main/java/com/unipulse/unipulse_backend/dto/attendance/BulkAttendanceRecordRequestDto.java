package com.unipulse.unipulse_backend.dto.attendance;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkAttendanceRecordRequestDto {

    @NotNull(message = "Session ID is required")
    private UUID sessionId;

    @NotEmpty(message = "Attendance records list cannot be empty")
    @Valid
    private List<AttendanceRecordEntryDto> records;
}
