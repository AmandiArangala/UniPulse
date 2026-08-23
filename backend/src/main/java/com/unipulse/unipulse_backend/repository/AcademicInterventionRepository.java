package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.AcademicIntervention;
import com.unipulse.unipulse_backend.model.enums.InterventionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicInterventionRepository extends JpaRepository<AcademicIntervention, UUID> {
    List<AcademicIntervention> findByStudentUserId(UUID studentId);
    List<AcademicIntervention> findByInitiatorId(UUID initiatorId);
    List<AcademicIntervention> findByStatus(InterventionStatus status);
}
