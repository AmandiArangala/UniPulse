package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.SemesterRequestDto;
import com.unipulse.unipulse_backend.dto.academic.SemesterResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SemesterService {
    SemesterResponseDto createSemester(SemesterRequestDto requestDto);
    SemesterResponseDto updateSemester(UUID id, SemesterRequestDto requestDto);
    SemesterResponseDto getSemesterById(UUID id);
    SemesterResponseDto getCurrentSemester();
    PagedResponse<SemesterResponseDto> getAllSemesters(String search, Pageable pageable);
    List<SemesterResponseDto> getAllSemestersList();
    SemesterResponseDto setCurrentSemester(UUID id);
    void deleteSemester(UUID id);
}
