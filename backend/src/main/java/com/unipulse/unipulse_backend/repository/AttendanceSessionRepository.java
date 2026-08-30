package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    List<AttendanceSession> findByModuleId(UUID moduleId);
    List<AttendanceSession> findByModuleIdOrderBySessionDateDesc(UUID moduleId);
    List<AttendanceSession> findByLecturerUserId(UUID lecturerId);
    List<AttendanceSession> findByModuleIdAndSessionDate(UUID moduleId, LocalDate sessionDate);
    List<AttendanceSession> findByModuleIdAndSessionDateBetween(UUID moduleId, LocalDate startDate, LocalDate endDate);
    long countByModuleId(UUID moduleId);
}

