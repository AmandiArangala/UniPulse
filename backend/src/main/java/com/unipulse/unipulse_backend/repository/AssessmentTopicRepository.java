package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.AssessmentTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentTopicRepository extends JpaRepository<AssessmentTopic, UUID> {
    List<AssessmentTopic> findByAssessmentId(UUID assessmentId);
    void deleteByAssessmentIdAndId(UUID assessmentId, UUID id);
    long countByAssessmentId(UUID assessmentId);
}
