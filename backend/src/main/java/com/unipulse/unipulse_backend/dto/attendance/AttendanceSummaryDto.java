package com.unipulse.unipulse_backend.dto.attendance;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSummaryDto {

    private UUID studentId;
    private String studentRegistrationNumber;
    private String studentName;
    private UUID moduleId;
    private String moduleCode;
    private long totalSessions;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long excusedCount;
    private double attendancePercentage;
    private boolean eligibleForExam;
    private String statusMessage;
}
