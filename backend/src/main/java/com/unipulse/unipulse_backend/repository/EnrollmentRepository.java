package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Enrollment;
import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    List<Enrollment> findByStudentUserId(UUID studentId);

    List<Enrollment> findByModuleId(UUID moduleId);

    List<Enrollment> findBySemesterId(UUID semesterId);

    List<Enrollment> findByStudentUserIdAndSemesterId(UUID studentId, UUID semesterId);

    List<Enrollment> findByStudentUserIdAndStatus(UUID studentId, EnrollmentStatus status);

    List<Enrollment> findByStudentUserIdAndSemesterIdAndStatus(UUID studentId, UUID semesterId, EnrollmentStatus status);

    List<Enrollment> findByModuleIdAndSemesterId(UUID moduleId, UUID semesterId);

    Optional<Enrollment> findByStudentUserIdAndModuleIdAndSemesterId(UUID studentId, UUID moduleId, UUID semesterId);

    boolean existsByStudentUserIdAndModuleIdAndSemesterId(UUID studentId, UUID moduleId, UUID semesterId);

    boolean existsByStudentUserIdAndModuleIdAndSemesterIdAndStatusIn(UUID studentId, UUID moduleId, UUID semesterId, Collection<EnrollmentStatus> statuses);

    @Query("SELECT COALESCE(SUM(e.module.creditHours), 0) FROM Enrollment e WHERE e.student.userId = :studentId AND e.semester.id = :semesterId AND e.status = :status")
    Integer sumCreditHoursByStudentAndSemesterAndStatus(@Param("studentId") UUID studentId, @Param("semesterId") UUID semesterId, @Param("status") EnrollmentStatus status);

    @Query("SELECT COALESCE(SUM(e.module.creditHours), 0) FROM Enrollment e WHERE e.student.userId = :studentId AND e.semester.id = :semesterId AND e.status IN :statuses")
    Integer sumCreditHoursByStudentAndSemesterAndStatusIn(@Param("studentId") UUID studentId, @Param("semesterId") UUID semesterId, @Param("statuses") Collection<EnrollmentStatus> statuses);

    @Query("SELECT COUNT(e) > 0 FROM Enrollment e WHERE e.student.userId = :studentId AND e.module.id = :moduleId AND e.status = 'COMPLETED'")
    boolean hasStudentCompletedModule(@Param("studentId") UUID studentId, @Param("moduleId") UUID moduleId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.userId = :studentId AND e.finalGrade IS NOT NULL")
    List<Enrollment> findGradedEnrollmentsByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.userId = :studentId AND e.semester.id = :semesterId AND e.finalGrade IS NOT NULL")
    List<Enrollment> findGradedEnrollmentsByStudentIdAndSemesterId(@Param("studentId") UUID studentId, @Param("semesterId") UUID semesterId);

    @Query("SELECT DISTINCT e.semester.id FROM Enrollment e WHERE e.student.userId = :studentId ORDER BY e.semester.startDate ASC")
    List<UUID> findDistinctSemesterIdsByStudentId(@Param("studentId") UUID studentId);
}

