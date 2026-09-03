package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.LearningEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningEventRepository extends JpaRepository<LearningEvent, UUID> {

    List<LearningEvent> findByStudentUserIdOrderByTimestampDesc(UUID studentId);

    List<LearningEvent> findByModuleIdOrderByTimestampDesc(UUID moduleId);

    List<LearningEvent> findByStudentUserIdAndModuleIdOrderByTimestampDesc(UUID studentId, UUID moduleId);

    List<LearningEvent> findByStudentUserIdAndModuleIdAndEventTypeOrderByTimestampDesc(UUID studentId, UUID moduleId, String eventType);

    long countByStudentUserIdAndModuleId(UUID studentId, UUID moduleId);

    long countByStudentUserIdAndModuleIdAndEventType(UUID studentId, UUID moduleId, String eventType);

    Optional<LearningEvent> findTopByStudentUserIdAndModuleIdOrderByTimestampDesc(UUID studentId, UUID moduleId);

    List<LearningEvent> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT e.eventType, COUNT(e) FROM LearningEvent e WHERE e.student.userId = :studentId AND e.module.id = :moduleId GROUP BY e.eventType")
    List<Object[]> countEventTypesByStudentAndModule(@Param("studentId") UUID studentId, @Param("moduleId") UUID moduleId);
}
