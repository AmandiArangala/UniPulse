package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.FacultyRequestDto;
import com.unipulse.unipulse_backend.dto.academic.FacultyResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface FacultyService {
    FacultyResponseDto createFaculty(FacultyRequestDto requestDto);
    FacultyResponseDto updateFaculty(UUID id, FacultyRequestDto requestDto);
    FacultyResponseDto getFacultyById(UUID id);
    FacultyResponseDto getFacultyByCode(String code);
    PagedResponse<FacultyResponseDto> getAllFaculties(String search, Pageable pageable);
    List<FacultyResponseDto> getAllFacultiesList();
    void deleteFaculty(UUID id);
}
