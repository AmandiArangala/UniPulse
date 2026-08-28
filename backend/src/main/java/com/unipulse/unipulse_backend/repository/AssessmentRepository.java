package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
    List<Assessment> findByModuleId(UUID moduleId);
    List<Assessment> findBySemesterId(UUID semesterId);
    List<Assessment> findByModuleIdAndType(UUID moduleId, AssessmentType type);
    List<Assessment> findByModuleIdAndSemesterId(UUID moduleId, UUID semesterId);
    
    boolean existsByModuleIdAndSemesterIdAndTitle(UUID moduleId, UUID semesterId, String title);

    @Query("SELECT COALESCE(SUM(a.weightPercentage), 0) FROM Assessment a WHERE a.module.id = :moduleId AND a.semester.id = :semesterId")
    BigDecimal sumWeightByModuleIdAndSemesterId(@Param("moduleId") UUID moduleId, @Param("semesterId") UUID semesterId);

    @Query("SELECT COALESCE(SUM(a.weightPercentage), 0) FROM Assessment a WHERE a.module.id = :moduleId AND a.semester.id = :semesterId AND a.id <> :excludeAssessmentId")
    BigDecimal sumWeightByModuleIdAndSemesterIdExcludingId(@Param("moduleId") UUID moduleId, @Param("semesterId") UUID semesterId, @Param("excludeAssessmentId") UUID excludeAssessmentId);
}
