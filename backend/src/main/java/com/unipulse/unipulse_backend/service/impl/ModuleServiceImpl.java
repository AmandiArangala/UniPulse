package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.ModuleRequestDto;
import com.unipulse.unipulse_backend.dto.academic.ModuleResponseDto;
import com.unipulse.unipulse_backend.dto.academic.PrerequisiteLinkRequestDto;
import com.unipulse.unipulse_backend.dto.academic.PrerequisiteResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.CircularDependencyException;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Department;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.ModulePrerequisite;
import com.unipulse.unipulse_backend.model.entity.ModulePrerequisiteId;
import com.unipulse.unipulse_backend.repository.DepartmentRepository;
import com.unipulse.unipulse_backend.repository.ModulePrerequisiteRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final DepartmentRepository departmentRepository;
    private final ModulePrerequisiteRepository modulePrerequisiteRepository;

    @Override
    @Transactional
    public ModuleResponseDto createModule(ModuleRequestDto requestDto) {
        Department department = departmentRepository.findById(requestDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDto.getDepartmentId()));

        String upperCode = requestDto.getCode().trim().toUpperCase();
        if (moduleRepository.existsByCode(upperCode)) {
            throw new DuplicateResourceException("Module", "code", requestDto.getCode());
        }

        Module module = Module.builder()
                .department(department)
                .code(upperCode)
                .title(requestDto.getTitle().trim())
                .creditHours(requestDto.getCreditHours())
                .description(requestDto.getDescription() != null ? requestDto.getDescription().trim() : null)
                .build();

        Module savedModule = moduleRepository.save(module);

        if (requestDto.getPrerequisites() != null && !requestDto.getPrerequisites().isEmpty()) {
            for (PrerequisiteLinkRequestDto linkDto : requestDto.getPrerequisites()) {
                addPrerequisiteToModule(savedModule, linkDto);
            }
            savedModule = moduleRepository.save(savedModule);
        }

        return mapToResponseDto(savedModule);
    }

    @Override
    @Transactional
    public ModuleResponseDto updateModule(UUID id, ModuleRequestDto requestDto) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));

        Department department = departmentRepository.findById(requestDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDto.getDepartmentId()));

        String upperCode = requestDto.getCode().trim().toUpperCase();
        if (moduleRepository.existsByCodeAndIdNot(upperCode, id)) {
            throw new DuplicateResourceException("Module", "code", requestDto.getCode());
        }

        module.setDepartment(department);
        module.setCode(upperCode);
        module.setTitle(requestDto.getTitle().trim());
        module.setCreditHours(requestDto.getCreditHours());
        module.setDescription(requestDto.getDescription() != null ? requestDto.getDescription().trim() : null);

        if (requestDto.getPrerequisites() != null) {
            modulePrerequisiteRepository.deleteByModuleId(id);
            module.getPrerequisites().clear();

            for (PrerequisiteLinkRequestDto linkDto : requestDto.getPrerequisites()) {
                addPrerequisiteToModule(module, linkDto);
            }
        }

        Module updatedModule = moduleRepository.save(module);
        return mapToResponseDto(updatedModule);
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleResponseDto getModuleById(UUID id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));
        return mapToResponseDto(module);
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleResponseDto getModuleByCode(String code) {
        Module module = moduleRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Module", "code", code));
        return mapToResponseDto(module);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ModuleResponseDto> getAllModules(UUID departmentId, String search, Pageable pageable) {
        Page<Module> page;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        String searchTerm = hasSearch ? search.trim() : "";

        if (departmentId != null && hasSearch) {
            page = moduleRepository.findByDepartmentIdAndTitleContainingIgnoreCaseOrDepartmentIdAndCodeContainingIgnoreCase(
                    departmentId, searchTerm, departmentId, searchTerm, pageable);
        } else if (departmentId != null) {
            page = moduleRepository.findByDepartmentId(departmentId, pageable);
        } else if (hasSearch) {
            page = moduleRepository.findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCase(searchTerm, searchTerm, pageable);
        } else {
            page = moduleRepository.findAll(pageable);
        }

        Page<ModuleResponseDto> dtoPage = page.map(this::mapToResponseDto);
        return PagedResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponseDto> getModulesByDepartmentId(UUID departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department", "id", departmentId);
        }
        return moduleRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public ModuleResponseDto addPrerequisite(UUID moduleId, PrerequisiteLinkRequestDto linkDto) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));

        addPrerequisiteToModule(module, linkDto);
        Module savedModule = moduleRepository.save(module);
        return mapToResponseDto(savedModule);
    }

    @Override
    @Transactional
    public ModuleResponseDto removePrerequisite(UUID moduleId, UUID prereqModuleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));

        modulePrerequisiteRepository.deleteByModuleIdAndPrerequisiteModuleId(moduleId, prereqModuleId);
        module.getPrerequisites().removeIf(mp -> mp.getPrerequisiteModule().getId().equals(prereqModuleId));

        return mapToResponseDto(module);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<PrerequisiteResponseDto> getModulePrerequisites(UUID moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module", "id", moduleId);
        }
        List<ModulePrerequisite> list = modulePrerequisiteRepository.findByModuleId(moduleId);
        return list.stream()
                .map(this::mapToPrerequisiteResponseDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public void deleteModule(UUID id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));

        Long enrollments = moduleRepository.countEnrollmentsByModuleId(id);
        if (enrollments != null && enrollments > 0) {
            throw new BadRequestException("Cannot delete Module because it has " + enrollments + " active student enrollment(s)");
        }

        Long prereqForOthers = moduleRepository.countAsPrerequisiteForOtherModules(id);
        if (prereqForOthers != null && prereqForOthers > 0) {
            throw new BadRequestException("Cannot delete Module because it serves as a prerequisite for " + prereqForOthers + " other module(s)");
        }

        moduleRepository.delete(module);
    }

    private void addPrerequisiteToModule(Module module, PrerequisiteLinkRequestDto linkDto) {
        UUID prereqId = linkDto.getPrerequisiteModuleId();
        Module prereqModule = moduleRepository.findById(prereqId)
                .orElseThrow(() -> new ResourceNotFoundException("Prerequisite Module", "id", prereqId));

        detectCircularDependency(module.getId(), prereqId);

        ModulePrerequisiteId id = new ModulePrerequisiteId(module.getId(), prereqId);
        ModulePrerequisite mp = ModulePrerequisite.builder()
                .id(id)
                .module(module)
                .prerequisiteModule(prereqModule)
                .isMandatory(linkDto.getIsMandatory() != null ? linkDto.getIsMandatory() : true)
                .minimumGrade(linkDto.getMinimumGrade() != null ? linkDto.getMinimumGrade() : "C")
                .build();

        module.getPrerequisites().removeIf(existing -> existing.getId().equals(id));
        module.getPrerequisites().add(mp);
    }

    private void detectCircularDependency(UUID moduleId, UUID proposedPrerequisiteId) {
        if (moduleId != null && moduleId.equals(proposedPrerequisiteId)) {
            throw new CircularDependencyException("A module cannot be its own prerequisite.");
        }

        if (moduleId == null) {
            return;
        }

        Set<UUID> visited = new HashSet<>();
        Queue<UUID> queue = new LinkedList<>();
        queue.add(proposedPrerequisiteId);

        while (!queue.isEmpty()) {
            UUID currentId = queue.poll();
            if (currentId.equals(moduleId)) {
                throw new CircularDependencyException("Circular prerequisite dependency detected: Adding this prerequisite would create a cyclic relationship chain.");
            }
            if (visited.add(currentId)) {
                List<ModulePrerequisite> currentPrereqs = modulePrerequisiteRepository.findByModuleId(currentId);
                for (ModulePrerequisite mp : currentPrereqs) {
                    queue.add(mp.getPrerequisiteModule().getId());
                }
            }
        }
    }

    private ModuleResponseDto mapToResponseDto(Module module) {
        Set<PrerequisiteResponseDto> prereqDtos = Collections.emptySet();
        if (module.getId() != null) {
            List<ModulePrerequisite> list = modulePrerequisiteRepository.findByModuleId(module.getId());
            prereqDtos = list.stream()
                    .map(this::mapToPrerequisiteResponseDto)
                    .collect(Collectors.toSet());
        }

        return ModuleResponseDto.builder()
                .id(module.getId())
                .departmentId(module.getDepartment().getId())
                .departmentName(module.getDepartment().getName())
                .departmentCode(module.getDepartment().getCode())
                .facultyId(module.getDepartment().getFaculty().getId())
                .facultyName(module.getDepartment().getFaculty().getName())
                .code(module.getCode())
                .title(module.getTitle())
                .creditHours(module.getCreditHours())
                .description(module.getDescription())
                .prerequisites(prereqDtos)
                .createdAt(module.getCreatedAt())
                .build();
    }

    private PrerequisiteResponseDto mapToPrerequisiteResponseDto(ModulePrerequisite mp) {
        return PrerequisiteResponseDto.builder()
                .prerequisiteModuleId(mp.getPrerequisiteModule().getId())
                .prerequisiteModuleCode(mp.getPrerequisiteModule().getCode())
                .prerequisiteModuleTitle(mp.getPrerequisiteModule().getTitle())
                .isMandatory(mp.getIsMandatory())
                .minimumGrade(mp.getMinimumGrade())
                .build();
    }
}
