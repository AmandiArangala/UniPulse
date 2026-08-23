package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    Optional<Semester> findByIsCurrentTrue();
    List<Semester> findByAcademicYear(Integer academicYear);
}
