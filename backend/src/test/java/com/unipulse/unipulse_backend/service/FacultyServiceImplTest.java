package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.FacultyRequestDto;
import com.unipulse.unipulse_backend.dto.academic.FacultyResponseDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Faculty;
import com.unipulse.unipulse_backend.repository.FacultyRepository;
import com.unipulse.unipulse_backend.service.impl.FacultyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyServiceImplTest {

    @Mock
    private FacultyRepository facultyRepository;

    @InjectMocks
    private FacultyServiceImpl facultyService;

    private Faculty faculty;
    private FacultyRequestDto requestDto;
    private UUID facultyId;

    @BeforeEach
    void setUp() {
        facultyId = UUID.randomUUID();
        faculty = Faculty.builder()
                .id(facultyId)
                .code("FOE")
                .name("Faculty of Engineering")
                .description("Engineering discipline")
                .build();

        requestDto = FacultyRequestDto.builder()
                .code("FOE")
                .name("Faculty of Engineering")
                .description("Engineering discipline")
                .build();
    }

    @Test
    @DisplayName("Should create faculty successfully when code is unique")
    void createFaculty_Success() {
        when(facultyRepository.existsByCode("FOE")).thenReturn(false);
        when(facultyRepository.save(any(Faculty.class))).thenReturn(faculty);
        when(facultyRepository.countDepartmentsByFacultyId(facultyId)).thenReturn(0L);

        FacultyResponseDto response = facultyService.createFaculty(requestDto);

        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("FOE");
        assertThat(response.getName()).isEqualTo("Faculty of Engineering");
        verify(facultyRepository, times(1)).save(any(Faculty.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when creating faculty with existing code")
    void createFaculty_DuplicateCode_ThrowsException() {
        when(facultyRepository.existsByCode("FOE")).thenReturn(true);

        assertThatThrownBy(() -> facultyService.createFaculty(requestDto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("FOE");

        verify(facultyRepository, never()).save(any(Faculty.class));
    }

    @Test
    @DisplayName("Should get faculty by ID successfully")
    void getFacultyById_Success() {
        when(facultyRepository.findById(facultyId)).thenReturn(Optional.of(faculty));
        when(facultyRepository.countDepartmentsByFacultyId(facultyId)).thenReturn(3L);

        FacultyResponseDto response = facultyService.getFacultyById(facultyId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(facultyId);
        assertThat(response.getDepartmentCount()).isEqualTo(3L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when faculty ID does not exist")
    void getFacultyById_NotFound_ThrowsException() {
        when(facultyRepository.findById(facultyId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> facultyService.getFacultyById(facultyId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should throw BadRequestException when deleting faculty that has associated departments")
    void deleteFaculty_WithDepartments_ThrowsException() {
        when(facultyRepository.findById(facultyId)).thenReturn(Optional.of(faculty));
        when(facultyRepository.countDepartmentsByFacultyId(facultyId)).thenReturn(2L);

        assertThatThrownBy(() -> facultyService.deleteFaculty(facultyId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("associated department");

        verify(facultyRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should delete faculty successfully when no departments are attached")
    void deleteFaculty_NoDepartments_Success() {
        when(facultyRepository.findById(facultyId)).thenReturn(Optional.of(faculty));
        when(facultyRepository.countDepartmentsByFacultyId(facultyId)).thenReturn(0L);

        facultyService.deleteFaculty(facultyId);

        verify(facultyRepository, times(1)).delete(faculty);
    }
}
