package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
    List<Assessment> findByModuleId(UUID moduleId);
    List<Assessment> findBySemesterId(UUID semesterId);
    List<Assessment> findByModuleIdAndType(UUID moduleId, AssessmentType type);
}
