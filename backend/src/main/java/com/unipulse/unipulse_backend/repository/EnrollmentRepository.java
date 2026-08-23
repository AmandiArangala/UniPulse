package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByStudentUserId(UUID studentId);
    List<Enrollment> findByModuleId(UUID moduleId);
    List<Enrollment> findBySemesterId(UUID semesterId);
    Optional<Enrollment> findByStudentUserIdAndModuleIdAndSemesterId(UUID studentId, UUID moduleId, UUID semesterId);
}
