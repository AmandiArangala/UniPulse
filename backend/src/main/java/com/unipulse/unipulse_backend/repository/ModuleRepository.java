package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Module;
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
public interface ModuleRepository extends JpaRepository<Module, UUID> {
    Optional<Module> findByCode(String code);

    List<Module> findByDepartmentId(UUID departmentId);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    Page<Module> findByDepartmentId(UUID departmentId, Pageable pageable);

    Page<Module> findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCase(String title, String code, Pageable pageable);

    Page<Module> findByDepartmentIdAndTitleContainingIgnoreCaseOrDepartmentIdAndCodeContainingIgnoreCase(
            UUID deptId1, String title, UUID deptId2, String code, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.module.id = :moduleId")
    Long countEnrollmentsByModuleId(@Param("moduleId") UUID moduleId);

    @Query("SELECT COUNT(mp) FROM ModulePrerequisite mp WHERE mp.id.prerequisiteModuleId = :moduleId")
    Long countAsPrerequisiteForOtherModules(@Param("moduleId") UUID moduleId);
}
