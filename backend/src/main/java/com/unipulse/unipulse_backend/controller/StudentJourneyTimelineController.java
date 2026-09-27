package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.student.StudentJourneyTimelineDto;
import com.unipulse.unipulse_backend.service.StudentJourneyTimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student-journey")
@RequiredArgsConstructor
public class StudentJourneyTimelineController {

    private final StudentJourneyTimelineService studentJourneyTimelineService;

    @GetMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADVISOR', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentJourneyTimelineDto>> getStudentJourneyTimeline(@PathVariable UUID studentId) {
        StudentJourneyTimelineDto timeline = studentJourneyTimelineService.getStudentJourneyTimeline(studentId);
        return ResponseEntity.ok(ApiResponse.success(timeline, "Student journey timeline retrieved successfully"));
    }
}
