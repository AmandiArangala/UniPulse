package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {
    Optional<Module> findByCode(String code);
    List<Module> findByDepartmentId(UUID departmentId);
}
