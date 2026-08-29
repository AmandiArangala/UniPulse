package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, UUID> {
    List<AssessmentResult> findByStudentUserId(UUID studentId);

    List<AssessmentResult> findByAssessmentId(UUID assessmentId);

    Optional<AssessmentResult> findByAssessmentIdAndStudentUserId(UUID assessmentId, UUID studentId);

    List<AssessmentResult> findByStudentUserIdAndAssessmentModuleIdAndAssessmentSemesterId(UUID studentId, UUID moduleId, UUID semesterId);

    List<AssessmentResult> findByStudentUserIdAndAssessmentSemesterId(UUID studentId, UUID semesterId);

    List<AssessmentResult> findByAssessmentModuleIdAndAssessmentSemesterId(UUID moduleId, UUID semesterId);

    @Query("SELECT ar FROM AssessmentResult ar WHERE ar.assessment.id = :assessmentId AND ar.scoreObtained IS NOT NULL")
    List<AssessmentResult> findGradedResultsByAssessmentId(@Param("assessmentId") UUID assessmentId);
}

