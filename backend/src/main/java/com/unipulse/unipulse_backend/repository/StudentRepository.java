package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByStudentNumber(String studentNumber);
    boolean existsByStudentNumber(String studentNumber);
    List<Student> findByProgramId(UUID programId);
    List<Student> findByProgramIdAndCurrentSemester(UUID programId, Integer currentSemester);
    List<Student> findByAcademicStatus(AcademicStatus status);
    List<Student> findByStudentNumberContainingIgnoreCase(String studentNumber);
}
