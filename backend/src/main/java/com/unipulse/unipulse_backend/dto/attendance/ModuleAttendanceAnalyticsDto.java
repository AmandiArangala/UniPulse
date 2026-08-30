package com.unipulse.unipulse_backend.dto.attendance;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleAttendanceAnalyticsDto {

    private UUID moduleId;
    private String moduleCode;
    private String moduleName;
    private long totalSessions;
    private long totalStudentsEnrolled;
    private long totalRecords;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long excusedCount;
    private double averageAttendancePercentage;
    private long lowAttendanceStudentsCount;
}
