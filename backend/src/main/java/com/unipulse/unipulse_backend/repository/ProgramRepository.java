package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Program;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgramRepository extends JpaRepository<Program, UUID> {
    Optional<Program> findByCode(String code);

    List<Program> findByDepartmentId(UUID departmentId);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    Page<Program> findByDepartmentId(UUID departmentId, Pageable pageable);

    Page<Program> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code, Pageable pageable);

    Page<Program> findByDepartmentIdAndNameContainingIgnoreCaseOrDepartmentIdAndCodeContainingIgnoreCase(
            UUID deptId1, String name, UUID deptId2, String code, Pageable pageable);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.program.id = :programId")
    Long countStudentsByProgramId(@Param("programId") UUID programId);
}
