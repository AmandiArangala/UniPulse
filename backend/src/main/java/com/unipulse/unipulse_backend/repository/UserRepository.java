package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.User;
import com.unipulse.unipulse_backend.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByRole(UserRole role);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
}
