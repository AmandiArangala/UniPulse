package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentResultResponseDto;
import com.unipulse.unipulse_backend.dto.assessment.BatchMarkEntryRequestDto;
import com.unipulse.unipulse_backend.dto.assessment.BatchMarkImportResultDto;
import com.unipulse.unipulse_backend.dto.assessment.MarkEntryRequestDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.entity.AssessmentResult;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.repository.AssessmentRepository;
import com.unipulse.unipulse_backend.repository.AssessmentResultRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import com.unipulse.unipulse_backend.service.MarksRecordingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarksRecordingServiceImpl implements MarksRecordingService {

    private final AssessmentRepository assessmentRepository;
    private final StudentRepository studentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final GpaCalculationService gpaCalculationService;

    @Override
    @Transactional
    public AssessmentResultResponseDto recordSingleMark(UUID assessmentId, MarkEntryRequestDto request) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with ID: " + assessmentId));

        Student student;
        if (request.getStudentId() != null) {
            student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));
        } else if (request.getStudentNumber() != null && !request.getStudentNumber().trim().isEmpty()) {
            student = studentRepository.findByStudentNumber(request.getStudentNumber().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with student number: " + request.getStudentNumber()));
        } else {
            throw new BadRequestException("Either studentId or studentNumber must be provided");
        }

        BigDecimal maxScore = assessment.getMaxScore() != null ? assessment.getMaxScore() : new BigDecimal("100.00");
        if (request.getScoreObtained().compareTo(maxScore) > 0) {
            throw new BadRequestException("Score obtained (" + request.getScoreObtained() + ") cannot exceed maximum score (" + maxScore + ")");
        }

        AssessmentResult result = assessmentResultRepository
                .findByAssessmentIdAndStudentUserId(assessmentId, student.getUserId())
                .orElseGet(() -> AssessmentResult.builder()
                        .assessment(assessment)
                        .student(student)
                        .build());

        result.setScoreObtained(request.getScoreObtained());
        result.setSubmittedAt(OffsetDateTime.now());
        result.setIsLate(request.getIsLate() != null ? request.getIsLate() : false);
        if (request.getFeedback() != null) {
            result.setFeedback(request.getFeedback().trim());
        }

        AssessmentResult saved = assessmentResultRepository.save(result);

        // Recalculate module grade & GPA cascade
        gpaCalculationService.calculateAndPersistModuleGrade(student.getUserId(), assessment.getModule().getId(), assessment.getSemester().getId());

        return mapToResponseDto(saved);
    }

    @Override
    public BatchMarkImportResultDto recordBatchMarks(UUID assessmentId, BatchMarkEntryRequestDto request) {
        throw new UnsupportedOperationException("Batch marks recording will be completed in Commit 9");
    }

    @Override
    public BatchMarkImportResultDto recordCsvBatchMarks(UUID assessmentId, InputStream inputStream) {
        throw new UnsupportedOperationException("CSV batch marks recording will be completed in Commit 9");
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResultResponseDto> getAssessmentResults(UUID assessmentId) {
        if (!assessmentRepository.existsById(assessmentId)) {
            throw new ResourceNotFoundException("Assessment not found with ID: " + assessmentId);
        }
        return assessmentResultRepository.findByAssessmentId(assessmentId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentResultResponseDto getStudentAssessmentResult(UUID assessmentId, UUID studentId) {
        AssessmentResult result = assessmentResultRepository.findByAssessmentIdAndStudentUserId(assessmentId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment result not found for student " + studentId + " on assessment " + assessmentId));
        return mapToResponseDto(result);
    }

    private AssessmentResultResponseDto mapToResponseDto(AssessmentResult result) {
        BigDecimal maxScore = result.getAssessment().getMaxScore() != null ? result.getAssessment().getMaxScore() : new BigDecimal("100.00");
        BigDecimal score = result.getScoreObtained() != null ? result.getScoreObtained() : BigDecimal.ZERO;
        BigDecimal percentage = score.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP);

        String studentName = result.getStudent().getUser() != null 
                ? result.getStudent().getUser().getFirstName() + " " + result.getStudent().getUser().getLastName()
                : "N/A";

        return AssessmentResultResponseDto.builder()
                .id(result.getId())
                .assessmentId(result.getAssessment().getId())
                .assessmentTitle(result.getAssessment().getTitle())
                .studentId(result.getStudent().getUserId())
                .studentNumber(result.getStudent().getStudentNumber())
                .studentName(studentName)
                .scoreObtained(score)
                .maxScore(maxScore)
                .percentageScore(percentage)
                .submittedAt(result.getSubmittedAt())
                .isLate(result.getIsLate())
                .feedback(result.getFeedback())
                .fileUrl(result.getFileUrl())
                .fileName(result.getFileName())
                .fileSizeBytes(result.getFileSizeBytes())
                .build();
    }
}
