package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.ModuleRequestDto;
import com.unipulse.unipulse_backend.dto.academic.ModuleResponseDto;
import com.unipulse.unipulse_backend.dto.academic.PrerequisiteLinkRequestDto;
import com.unipulse.unipulse_backend.dto.academic.PrerequisiteResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface ModuleService {
    ModuleResponseDto createModule(ModuleRequestDto requestDto);
    ModuleResponseDto updateModule(UUID id, ModuleRequestDto requestDto);
    ModuleResponseDto getModuleById(UUID id);
    ModuleResponseDto getModuleByCode(String code);
    PagedResponse<ModuleResponseDto> getAllModules(UUID departmentId, String search, Pageable pageable);
    List<ModuleResponseDto> getModulesByDepartmentId(UUID departmentId);
    ModuleResponseDto addPrerequisite(UUID moduleId, PrerequisiteLinkRequestDto linkDto);
    ModuleResponseDto removePrerequisite(UUID moduleId, UUID prereqModuleId);
    Set<PrerequisiteResponseDto> getModulePrerequisites(UUID moduleId);
    void deleteModule(UUID id);
}
