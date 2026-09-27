package com.unipulse.unipulse_backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentJourneyTimelineDto {
    private UUID studentId;
    private String studentNumber;
    private String studentName;
    private String programCode;
    private int totalEventsCount;
    private int openInterventionsCount;
    private List<TimelineEventDto> timelineEvents;
}
