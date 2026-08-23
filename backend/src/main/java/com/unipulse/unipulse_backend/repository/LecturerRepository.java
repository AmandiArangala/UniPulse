package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, UUID> {
    Optional<Lecturer> findByEmployeeNumber(String employeeNumber);
    List<Lecturer> findByDepartmentId(UUID departmentId);
}
