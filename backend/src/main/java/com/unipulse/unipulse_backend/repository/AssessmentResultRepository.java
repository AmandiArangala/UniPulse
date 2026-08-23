package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, UUID> {
    List<AssessmentResult> findByStudentUserId(UUID studentId);
    List<AssessmentResult> findByAssessmentId(UUID assessmentId);
    Optional<AssessmentResult> findByAssessmentIdAndStudentUserId(UUID assessmentId, UUID studentId);
}
