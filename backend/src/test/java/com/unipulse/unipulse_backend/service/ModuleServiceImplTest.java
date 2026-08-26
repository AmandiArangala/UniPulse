package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.PrerequisiteLinkRequestDto;
import com.unipulse.unipulse_backend.exception.CircularDependencyException;
import com.unipulse.unipulse_backend.model.entity.Department;
import com.unipulse.unipulse_backend.model.entity.Faculty;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.ModulePrerequisite;
import com.unipulse.unipulse_backend.model.entity.ModulePrerequisiteId;
import com.unipulse.unipulse_backend.repository.DepartmentRepository;
import com.unipulse.unipulse_backend.repository.ModulePrerequisiteRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.service.impl.ModuleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModuleServiceImplTest {

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private ModulePrerequisiteRepository modulePrerequisiteRepository;

    @InjectMocks
    private ModuleServiceImpl moduleService;

    private UUID moduleAId;
    private UUID moduleBId;
    private UUID moduleCId;

    private Module moduleA;
    private Module moduleB;
    private Module moduleC;

    @BeforeEach
    void setUp() {
        Faculty faculty = Faculty.builder()
                .id(UUID.randomUUID())
                .code("FOE")
                .name("Engineering")
                .build();

        Department department = Department.builder()
                .id(UUID.randomUUID())
                .faculty(faculty)
                .code("CS")
                .name("Computer Science")
                .build();

        moduleAId = UUID.randomUUID();
        moduleBId = UUID.randomUUID();
        moduleCId = UUID.randomUUID();

        moduleA = Module.builder()
                .id(moduleAId)
                .department(department)
                .code("CS101")
                .title("Programming Fundamental")
                .creditHours(3)
                .prerequisites(new HashSet<>())
                .build();

        moduleB = Module.builder()
                .id(moduleBId)
                .department(department)
                .code("CS201")
                .title("Data Structures")
                .creditHours(3)
                .prerequisites(new HashSet<>())
                .build();

        moduleC = Module.builder()
                .id(moduleCId)
                .department(department)
                .code("CS301")
                .title("Algorithms")
                .creditHours(3)
                .prerequisites(new HashSet<>())
                .build();
    }

    @Test
    @DisplayName("Should throw CircularDependencyException when module is set as its own prerequisite")
    void addPrerequisite_SelfDependency_ThrowsException() {
        when(moduleRepository.findById(moduleAId)).thenReturn(Optional.of(moduleA));

        PrerequisiteLinkRequestDto linkDto = PrerequisiteLinkRequestDto.builder()
                .prerequisiteModuleId(moduleAId)
                .isMandatory(true)
                .minimumGrade("C")
                .build();

        assertThatThrownBy(() -> moduleService.addPrerequisite(moduleAId, linkDto))
                .isInstanceOf(CircularDependencyException.class)
                .hasMessageContaining("own prerequisite");
    }

    @Test
    @DisplayName("Should throw CircularDependencyException when direct cycle A -> B -> A is created")
    void addPrerequisite_DirectCycle_ThrowsException() {
        // Module B already has Module A as a prerequisite (B depends on A: B -> A)
        ModulePrerequisite mpBtoA = ModulePrerequisite.builder()
                .id(new ModulePrerequisiteId(moduleBId, moduleAId))
                .module(moduleB)
                .prerequisiteModule(moduleA)
                .isMandatory(true)
                .minimumGrade("C")
                .build();

        when(moduleRepository.findById(moduleAId)).thenReturn(Optional.of(moduleA));
        when(moduleRepository.findById(moduleBId)).thenReturn(Optional.of(moduleB));

        // When checking prerequisites of B, it has A
        when(modulePrerequisiteRepository.findByModuleId(moduleBId)).thenReturn(List.of(mpBtoA));

        // Now attempt to make A depend on B (A -> B), which completes cycle A -> B -> A
        PrerequisiteLinkRequestDto linkDto = PrerequisiteLinkRequestDto.builder()
                .prerequisiteModuleId(moduleBId)
                .isMandatory(true)
                .minimumGrade("C")
                .build();

        assertThatThrownBy(() -> moduleService.addPrerequisite(moduleAId, linkDto))
                .isInstanceOf(CircularDependencyException.class)
                .hasMessageContaining("Circular prerequisite dependency detected");
    }

    @Test
    @DisplayName("Should throw CircularDependencyException when indirect cycle A -> B -> C -> A is created")
    void addPrerequisite_IndirectCycle_ThrowsException() {
        // C depends on B (C -> B)
        ModulePrerequisite mpCtoB = ModulePrerequisite.builder()
                .id(new ModulePrerequisiteId(moduleCId, moduleBId))
                .module(moduleC)
                .prerequisiteModule(moduleB)
                .isMandatory(true)
                .minimumGrade("C")
                .build();

        // B depends on A (B -> A)
        ModulePrerequisite mpBtoA = ModulePrerequisite.builder()
                .id(new ModulePrerequisiteId(moduleBId, moduleAId))
                .module(moduleB)
                .prerequisiteModule(moduleA)
                .isMandatory(true)
                .minimumGrade("C")
                .build();

        when(moduleRepository.findById(moduleAId)).thenReturn(Optional.of(moduleA));
        when(moduleRepository.findById(moduleCId)).thenReturn(Optional.of(moduleC));

        when(modulePrerequisiteRepository.findByModuleId(moduleCId)).thenReturn(List.of(mpCtoB));
        when(modulePrerequisiteRepository.findByModuleId(moduleBId)).thenReturn(List.of(mpBtoA));

        // Attempting to make A depend on C (A -> C). Chain would be A -> C -> B -> A!
        PrerequisiteLinkRequestDto linkDto = PrerequisiteLinkRequestDto.builder()
                .prerequisiteModuleId(moduleCId)
                .isMandatory(true)
                .minimumGrade("C")
                .build();

        assertThatThrownBy(() -> moduleService.addPrerequisite(moduleAId, linkDto))
                .isInstanceOf(CircularDependencyException.class)
                .hasMessageContaining("Circular prerequisite dependency detected");
    }
}
