package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.ModuleDifficultyIndexDto;

import java.util.List;
import java.util.UUID;

public interface ModuleDifficultyService {
    ModuleDifficultyIndexDto calculateModuleDifficultyIndex(UUID moduleId);
    List<ModuleDifficultyIndexDto> getAllModuleDifficultyIndexes();
}
