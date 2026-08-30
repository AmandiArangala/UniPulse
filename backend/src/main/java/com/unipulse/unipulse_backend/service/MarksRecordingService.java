package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentResultResponseDto;
import com.unipulse.unipulse_backend.dto.assessment.BatchMarkEntryRequestDto;
import com.unipulse.unipulse_backend.dto.assessment.BatchMarkImportResultDto;
import com.unipulse.unipulse_backend.dto.assessment.MarkEntryRequestDto;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

public interface MarksRecordingService {

    AssessmentResultResponseDto recordSingleMark(UUID assessmentId, MarkEntryRequestDto request);

    BatchMarkImportResultDto recordBatchMarks(UUID assessmentId, BatchMarkEntryRequestDto request);

    BatchMarkImportResultDto recordCsvBatchMarks(UUID assessmentId, InputStream inputStream);

    List<AssessmentResultResponseDto> getAssessmentResults(UUID assessmentId);

    AssessmentResultResponseDto getStudentAssessmentResult(UUID assessmentId, UUID studentId);
}
