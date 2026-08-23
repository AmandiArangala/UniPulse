package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgramRepository extends JpaRepository<Program, UUID> {
    Optional<Program> findByCode(String code);
    List<Program> findByDepartmentId(UUID departmentId);
}
