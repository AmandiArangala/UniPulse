package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Advisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdvisorRepository extends JpaRepository<Advisor, UUID> {
    Optional<Advisor> findByEmployeeNumber(String employeeNumber);
    List<Advisor> findByDepartmentId(UUID departmentId);
}
