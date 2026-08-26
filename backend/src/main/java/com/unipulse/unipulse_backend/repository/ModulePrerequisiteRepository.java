package com.unipulse.unipulse_backend.repository;

import com.unipulse.unipulse_backend.model.entity.ModulePrerequisite;
import com.unipulse.unipulse_backend.model.entity.ModulePrerequisiteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModulePrerequisiteRepository extends JpaRepository<ModulePrerequisite, ModulePrerequisiteId> {
    List<ModulePrerequisite> findByModuleId(UUID moduleId);

    List<ModulePrerequisite> findByPrerequisiteModuleId(UUID prerequisiteModuleId);

    @Query("SELECT mp FROM ModulePrerequisite mp WHERE mp.id.moduleId = :moduleId AND mp.id.prerequisiteModuleId = :prereqId")
    Optional<ModulePrerequisite> findByModuleIdAndPrerequisiteModuleId(@Param("moduleId") UUID moduleId, @Param("prereqId") UUID prereqId);

    @Modifying
    @Query("DELETE FROM ModulePrerequisite mp WHERE mp.id.moduleId = :moduleId AND mp.id.prerequisiteModuleId = :prereqId")
    void deleteByModuleIdAndPrerequisiteModuleId(@Param("moduleId") UUID moduleId, @Param("prereqId") UUID prereqId);

    @Modifying
    @Query("DELETE FROM ModulePrerequisite mp WHERE mp.id.moduleId = :moduleId")
    void deleteByModuleId(@Param("moduleId") UUID moduleId);
}
