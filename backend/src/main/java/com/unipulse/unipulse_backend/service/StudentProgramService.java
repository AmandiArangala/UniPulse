package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.student.StudentProgramEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.student.StudentProgramResponseDto;

import java.util.List;
import java.util.UUID;

public interface StudentProgramService {
    StudentProgramResponseDto enrollStudentInProgram(StudentProgramEnrollmentRequestDto request);
    StudentProgramResponseDto updateStudentProgram(UUID studentId, UUID newProgramId);
    StudentProgramResponseDto advanceStudentSemester(UUID studentId, Integer newSemester);
    StudentProgramResponseDto getStudentProgramDetails(UUID studentId);
    List<StudentProgramResponseDto> getStudentsByProgram(UUID programId);
    List<StudentProgramResponseDto> getStudentsByProgramAndSemester(UUID programId, Integer semester);
}
