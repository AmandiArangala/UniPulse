package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.student.StudentJourneyTimelineDto;

import java.util.UUID;

public interface StudentJourneyTimelineService {
    StudentJourneyTimelineDto getStudentJourneyTimeline(UUID studentId);
}
