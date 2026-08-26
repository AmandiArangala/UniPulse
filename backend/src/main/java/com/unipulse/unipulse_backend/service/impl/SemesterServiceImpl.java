package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.SemesterRequestDto;
import com.unipulse.unipulse_backend.dto.academic.SemesterResponseDto;
import com.unipulse.unipulse_backend.dto.common.PagedResponse;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Semester;
import com.unipulse.unipulse_backend.repository.SemesterRepository;
import com.unipulse.unipulse_backend.service.SemesterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {

    private final SemesterRepository semesterRepository;

    @Override
    @Transactional
    public SemesterResponseDto createSemester(SemesterRequestDto requestDto) {
        validateDates(requestDto);

        String trimmedName = requestDto.getName().trim();
        if (semesterRepository.existsByNameAndAcademicYear(trimmedName, requestDto.getAcademicYear())) {
            throw new DuplicateResourceException("Semester", "name and academic year", trimmedName + " (" + requestDto.getAcademicYear() + ")");
        }

        Semester semester = Semester.builder()
                .name(trimmedName)
                .academicYear(requestDto.getAcademicYear())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .isCurrent(Boolean.TRUE.equals(requestDto.getIsCurrent()))
                .build();

        Semester savedSemester = semesterRepository.save(semester);

        if (Boolean.TRUE.equals(savedSemester.getIsCurrent())) {
            semesterRepository.unsetOtherCurrentSemesters(savedSemester.getId());
        }

        return mapToResponseDto(savedSemester);
    }

    @Override
    @Transactional
    public SemesterResponseDto updateSemester(UUID id, SemesterRequestDto requestDto) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", id));

        validateDates(requestDto);

        String trimmedName = requestDto.getName().trim();
        if (semesterRepository.existsByNameAndAcademicYearAndIdNot(trimmedName, requestDto.getAcademicYear(), id)) {
            throw new DuplicateResourceException("Semester", "name and academic year", trimmedName + " (" + requestDto.getAcademicYear() + ")");
        }

        semester.setName(trimmedName);
        semester.setAcademicYear(requestDto.getAcademicYear());
        semester.setStartDate(requestDto.getStartDate());
        semester.setEndDate(requestDto.getEndDate());
        if (requestDto.getIsCurrent() != null) {
            semester.setIsCurrent(requestDto.getIsCurrent());
        }

        Semester updatedSemester = semesterRepository.save(semester);

        if (Boolean.TRUE.equals(updatedSemester.getIsCurrent())) {
            semesterRepository.unsetOtherCurrentSemesters(updatedSemester.getId());
        }

        return mapToResponseDto(updatedSemester);
    }

    @Override
    @Transactional(readOnly = true)
    public SemesterResponseDto getSemesterById(UUID id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", id));
        return mapToResponseDto(semester);
    }

    @Override
    @Transactional(readOnly = true)
    public SemesterResponseDto getCurrentSemester() {
        Semester semester = semesterRepository.findFirstByIsCurrentTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active current semester is set."));
        return mapToResponseDto(semester);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SemesterResponseDto> getAllSemesters(String search, Pageable pageable) {
        Page<Semester> page;
        if (search != null && !search.trim().isEmpty()) {
            page = semesterRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        } else {
            page = semesterRepository.findAll(pageable);
        }

        Page<SemesterResponseDto> dtoPage = page.map(this::mapToResponseDto);
        return PagedResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SemesterResponseDto> getAllSemestersList() {
        return semesterRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public SemesterResponseDto setCurrentSemester(UUID id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", id));

        semester.setIsCurrent(true);
        Semester updatedSemester = semesterRepository.save(semester);
        semesterRepository.unsetOtherCurrentSemesters(id);

        return mapToResponseDto(updatedSemester);
    }

    @Override
    @Transactional
    public void deleteSemester(UUID id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", id));

        Long enrollmentCount = semesterRepository.countEnrollmentsBySemesterId(id);
        if (enrollmentCount != null && enrollmentCount > 0) {
            throw new BadRequestException("Cannot delete Semester because it has " + enrollmentCount + " active enrollment(s)");
        }

        semesterRepository.delete(semester);
    }

    private void validateDates(SemesterRequestDto dto) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("Semester end date cannot be before start date");
        }
    }

    private SemesterResponseDto mapToResponseDto(Semester semester) {
        Long enrollments = semesterRepository.countEnrollmentsBySemesterId(semester.getId());

        return SemesterResponseDto.builder()
                .id(semester.getId())
                .name(semester.getName())
                .academicYear(semester.getAcademicYear())
                .startDate(semester.getStartDate())
                .endDate(semester.getEndDate())
                .isCurrent(semester.getIsCurrent())
                .activeEnrollmentCount(enrollments != null ? enrollments : 0L)
                .build();
    }
}
