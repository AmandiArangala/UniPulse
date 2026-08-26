package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.ProgramRequestDto;
import com.unipulse.unipulse_backend.dto.academic.ProgramResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProgramService {
    ProgramResponseDto createProgram(ProgramRequestDto requestDto);
    ProgramResponseDto updateProgram(UUID id, ProgramRequestDto requestDto);
    ProgramResponseDto getProgramById(UUID id);
    ProgramResponseDto getProgramByCode(String code);
    PagedResponse<ProgramResponseDto> getAllPrograms(UUID departmentId, String search, Pageable pageable);
    List<ProgramResponseDto> getProgramsByDepartmentId(UUID departmentId);
    void deleteProgram(UUID id);
}
