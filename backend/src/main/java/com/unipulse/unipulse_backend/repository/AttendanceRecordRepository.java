package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.AttendanceRecord;
import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByStudentUserId(UUID studentId);
    List<AttendanceRecord> findBySessionId(UUID sessionId);
    List<AttendanceRecord> findByStudentUserIdAndStatus(UUID studentId, AttendanceStatus status);
    Optional<AttendanceRecord> findBySessionIdAndStudentUserId(UUID sessionId, UUID studentId);
    List<AttendanceRecord> findByStudentUserIdAndSessionModuleId(UUID studentId, UUID moduleId);
    long countByStudentUserIdAndSessionModuleId(UUID studentId, UUID moduleId);
    long countByStudentUserIdAndSessionModuleIdAndStatus(UUID studentId, UUID moduleId, AttendanceStatus status);
    long countBySessionModuleIdAndStatus(UUID moduleId, AttendanceStatus status);
}

