package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.StudentProgramEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.student.StudentProgramResponseDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Program;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import com.unipulse.unipulse_backend.repository.ProgramRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.StudentProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentProgramServiceImpl implements StudentProgramService {

    private final StudentRepository studentRepository;
    private final ProgramRepository programRepository;

    @Override
    @Transactional
    public StudentProgramResponseDto enrollStudentInProgram(StudentProgramEnrollmentRequestDto request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", request.getProgramId()));

        student.setProgram(program);
        student.setEnrollmentYear(request.getEnrollmentYear());
        if (request.getCurrentSemester() != null) {
            student.setCurrentSemester(request.getCurrentSemester());
        }
        if (student.getAcademicStatus() == null) {
            student.setAcademicStatus(AcademicStatus.GOOD_STANDING);
        }

        Student updatedStudent = studentRepository.save(student);
        return mapToResponseDto(updatedStudent);
    }

    @Override
    @Transactional
    public StudentProgramResponseDto updateStudentProgram(UUID studentId, UUID newProgramId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Program newProgram = programRepository.findById(newProgramId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", newProgramId));

        student.setProgram(newProgram);
        Student updatedStudent = studentRepository.save(student);
        return mapToResponseDto(updatedStudent);
    }

    @Override
    @Transactional
    public StudentProgramResponseDto advanceStudentSemester(UUID studentId, Integer newSemester) {
        if (newSemester == null || newSemester < 1 || newSemester > 12) {
            throw new BadRequestException("Semester level must be between 1 and 12");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        student.setCurrentSemester(newSemester);
        Student updatedStudent = studentRepository.save(student);
        return mapToResponseDto(updatedStudent);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProgramResponseDto getStudentProgramDetails(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        return mapToResponseDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentProgramResponseDto> getStudentsByProgram(UUID programId) {
        if (!programRepository.existsById(programId)) {
            throw new ResourceNotFoundException("Program", "id", programId);
        }
        return studentRepository.findByProgramId(programId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentProgramResponseDto> getStudentsByProgramAndSemester(UUID programId, Integer semester) {
        if (!programRepository.existsById(programId)) {
            throw new ResourceNotFoundException("Program", "id", programId);
        }
        return studentRepository.findByProgramIdAndCurrentSemester(programId, semester).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private StudentProgramResponseDto mapToResponseDto(Student student) {
        String studentName = "";
        String email = "";
        if (student.getUser() != null) {
            studentName = student.getUser().getFirstName() + " " + student.getUser().getLastName();
            email = student.getUser().getEmail();
        }

        return StudentProgramResponseDto.builder()
                .studentId(student.getUserId())
                .studentNumber(student.getStudentNumber())
                .studentName(studentName)
                .email(email)
                .programId(student.getProgram() != null ? student.getProgram().getId() : null)
                .programCode(student.getProgram() != null ? student.getProgram().getCode() : null)
                .programName(student.getProgram() != null ? student.getProgram().getName() : null)
                .currentSemester(student.getCurrentSemester())
                .gpa(student.getGpa())
                .academicStatus(student.getAcademicStatus())
                .enrollmentYear(student.getEnrollmentYear())
                .build();
    }
}
