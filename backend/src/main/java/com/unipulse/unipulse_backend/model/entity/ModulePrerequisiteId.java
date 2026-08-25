package com.unipulse.unipulse_backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModulePrerequisiteId implements Serializable {

    @Column(name = "module_id")
    private UUID moduleId;

    @Column(name = "prerequisite_module_id")
    private UUID prerequisiteModuleId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ModulePrerequisiteId that = (ModulePrerequisiteId) o;
        return Objects.equals(moduleId, that.moduleId) &&
                Objects.equals(prerequisiteModuleId, that.prerequisiteModuleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(moduleId, prerequisiteModuleId);
    }
}
