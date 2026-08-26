package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Department;
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
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByCode(String code);

    List<Department> findByFacultyId(UUID facultyId);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    Page<Department> findByFacultyId(UUID facultyId, Pageable pageable);

    Page<Department> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code, Pageable pageable);

    Page<Department> findByFacultyIdAndNameContainingIgnoreCaseOrFacultyIdAndCodeContainingIgnoreCase(
            UUID facultyId1, String name, UUID facultyId2, String code, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Program p WHERE p.department.id = :departmentId")
    Long countProgramsByDepartmentId(@Param("departmentId") UUID departmentId);

    @Query("SELECT COUNT(m) FROM Module m WHERE m.department.id = :departmentId")
    Long countModulesByDepartmentId(@Param("departmentId") UUID departmentId);
}
