package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.assessment.*;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import com.unipulse.unipulse_backend.service.MarksRecordingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
public class MarksController {

    private final MarksRecordingService marksRecordingService;
    private final GpaCalculationService gpaCalculationService;

    @PostMapping("/{assessmentId}/marks")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentResultResponseDto>> recordSingleMark(
            @PathVariable UUID assessmentId,
            @Valid @RequestBody MarkEntryRequestDto request
    ) {
        AssessmentResultResponseDto response = marksRecordingService.recordSingleMark(assessmentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Assessment mark recorded successfully"));
    }

    @PostMapping("/{assessmentId}/marks/batch")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BatchMarkImportResultDto>> recordBatchMarks(
            @PathVariable UUID assessmentId,
            @Valid @RequestBody BatchMarkEntryRequestDto request
    ) {
        BatchMarkImportResultDto response = marksRecordingService.recordBatchMarks(assessmentId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Batch assessment marks recorded successfully"));
    }

    @PostMapping(value = "/{assessmentId}/marks/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BatchMarkImportResultDto>> uploadCsvMarks(
            @PathVariable UUID assessmentId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Uploaded CSV file cannot be empty"));
        }
        BatchMarkImportResultDto response = marksRecordingService.recordCsvBatchMarks(assessmentId, file.getInputStream());
        return ResponseEntity.ok(ApiResponse.success(response, "CSV marks spreadsheet imported successfully"));
    }

    @GetMapping("/{assessmentId}/marks")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AssessmentResultResponseDto>>> getAssessmentResults(
            @PathVariable UUID assessmentId
    ) {
        List<AssessmentResultResponseDto> response = marksRecordingService.getAssessmentResults(assessmentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Assessment results retrieved successfully"));
    }

    @GetMapping("/{assessmentId}/marks/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentResultResponseDto>> getStudentAssessmentResult(
            @PathVariable UUID assessmentId,
            @PathVariable UUID studentId
    ) {
        AssessmentResultResponseDto response = marksRecordingService.getStudentAssessmentResult(assessmentId, studentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student assessment result retrieved successfully"));
    }

    @GetMapping("/{assessmentId}/analytics")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentAnalyticsDto>> getAssessmentAnalytics(
            @PathVariable UUID assessmentId
    ) {
        AssessmentAnalyticsDto response = gpaCalculationService.computeAssessmentAnalytics(assessmentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Assessment diagnostic analytics retrieved successfully"));
    }
}
