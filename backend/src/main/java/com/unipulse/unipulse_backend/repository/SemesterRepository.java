package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Semester;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    Optional<Semester> findByIsCurrentTrue();

    Optional<Semester> findFirstByIsCurrentTrue();

    List<Semester> findByAcademicYear(Integer academicYear);

    boolean existsByNameAndAcademicYear(String name, Integer academicYear);

    boolean existsByNameAndAcademicYearAndIdNot(String name, Integer academicYear, UUID id);

    Page<Semester> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Modifying
    @Query("UPDATE Semester s SET s.isCurrent = false WHERE s.id != :activeSemesterId")
    void unsetOtherCurrentSemesters(@Param("activeSemesterId") UUID activeSemesterId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.semester.id = :semesterId")
    Long countEnrollmentsBySemesterId(@Param("semesterId") UUID semesterId);
}
