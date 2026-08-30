package com.unipulse.unipulse_backend.dto.attendance;

import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecordResponseDto {

    private UUID id;
    private UUID sessionId;
    private UUID studentId;
    private String studentRegistrationNumber;
    private String studentName;
    private AttendanceStatus status;
    private String remarks;
}
