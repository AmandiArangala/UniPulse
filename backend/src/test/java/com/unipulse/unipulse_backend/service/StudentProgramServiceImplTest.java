package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.student.StudentProgramEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.student.StudentProgramResponseDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Program;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.entity.User;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import com.unipulse.unipulse_backend.model.enums.UserRole;
import com.unipulse.unipulse_backend.repository.ProgramRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.impl.StudentProgramServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentProgramServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ProgramRepository programRepository;

    @InjectMocks
    private StudentProgramServiceImpl studentProgramService;

    private UUID studentId;
    private UUID programId;
    private Student student;
    private Program program;
    private User user;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        programId = UUID.randomUUID();

        user = User.builder()
                .id(studentId)
                .username("john_doe")
                .email("john@unipulse.edu")
                .firstName("John")
                .lastName("Doe")
                .role(UserRole.STUDENT)
                .build();

        program = Program.builder()
                .id(programId)
                .code("BSCS")
                .name("BSc Computer Science")
                .totalCredits(120)
                .build();

        student = Student.builder()
                .userId(studentId)
                .user(user)
                .studentNumber("STU-2026-001")
                .program(program)
                .currentSemester(1)
                .gpa(BigDecimal.valueOf(3.8))
                .academicStatus(AcademicStatus.GOOD_STANDING)
                .enrollmentYear(2026)
                .build();
    }

    @Test
    @DisplayName("Should enroll student in program successfully")
    void enrollStudentInProgram_Success() {
        StudentProgramEnrollmentRequestDto request = StudentProgramEnrollmentRequestDto.builder()
                .studentId(studentId)
                .programId(programId)
                .enrollmentYear(2026)
                .currentSemester(1)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentProgramResponseDto response = studentProgramService.enrollStudentInProgram(request);

        assertThat(response).isNotNull();
        assertThat(response.getStudentNumber()).isEqualTo("STU-2026-001");
        assertThat(response.getProgramCode()).isEqualTo("BSCS");
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when student not found during program enrollment")
    void enrollStudentInProgram_StudentNotFound_ThrowsException() {
        StudentProgramEnrollmentRequestDto request = StudentProgramEnrollmentRequestDto.builder()
                .studentId(studentId)
                .programId(programId)
                .enrollmentYear(2026)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentProgramService.enrollStudentInProgram(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should advance student semester level successfully")
    void advanceStudentSemester_Success() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentProgramResponseDto response = studentProgramService.advanceStudentSemester(studentId, 2);

        assertThat(response).isNotNull();
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when advancing to invalid semester level")
    void advanceStudentSemester_InvalidSemester_ThrowsException() {
        assertThatThrownBy(() -> studentProgramService.advanceStudentSemester(studentId, 15))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("between 1 and 12");
    }

    @Test
    @DisplayName("Should retrieve students by program ID and semester filter")
    void getStudentsByProgramAndSemester_Success() {
        when(programRepository.existsById(programId)).thenReturn(true);
        when(studentRepository.findByProgramIdAndCurrentSemester(programId, 1)).thenReturn(List.of(student));

        List<StudentProgramResponseDto> list = studentProgramService.getStudentsByProgramAndSemester(programId, 1);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getStudentNumber()).isEqualTo("STU-2026-001");
    }
}
