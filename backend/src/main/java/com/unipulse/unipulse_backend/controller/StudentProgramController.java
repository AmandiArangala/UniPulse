package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.student.StudentProgramEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.student.StudentProgramResponseDto;
import com.unipulse.unipulse_backend.service.StudentProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students/program")
@RequiredArgsConstructor
public class StudentProgramController {

    private final StudentProgramService studentProgramService;

    @PostMapping("/enroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR')")
    public ResponseEntity<ApiResponse<StudentProgramResponseDto>> enrollStudentInProgram(
            @Valid @RequestBody StudentProgramEnrollmentRequestDto request
    ) {
        StudentProgramResponseDto response = studentProgramService.enrollStudentInProgram(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Student enrolled in program successfully"));
    }

    @PutMapping("/{studentId}/program")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR')")
    public ResponseEntity<ApiResponse<StudentProgramResponseDto>> updateStudentProgram(
            @PathVariable UUID studentId,
            @RequestParam UUID newProgramId
    ) {
        StudentProgramResponseDto response = studentProgramService.updateStudentProgram(studentId, newProgramId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student program updated successfully"));
    }

    @PutMapping("/{studentId}/semester")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR')")
    public ResponseEntity<ApiResponse<StudentProgramResponseDto>> advanceStudentSemester(
            @PathVariable UUID studentId,
            @RequestParam Integer newSemester
    ) {
        StudentProgramResponseDto response = studentProgramService.advanceStudentSemester(studentId, newSemester);
        return ResponseEntity.ok(ApiResponse.success(response, "Student semester level updated successfully"));
    }

    @GetMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER', 'STUDENT')")
    public ResponseEntity<ApiResponse<StudentProgramResponseDto>> getStudentProgramDetails(
            @PathVariable UUID studentId
    ) {
        StudentProgramResponseDto response = studentProgramService.getStudentProgramDetails(studentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student program details retrieved successfully"));
    }

    @GetMapping("/roster/{programId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<StudentProgramResponseDto>>> getStudentsByProgram(
            @PathVariable UUID programId,
            @RequestParam(required = false) Integer semester
    ) {
        List<StudentProgramResponseDto> response;
        if (semester != null) {
            response = studentProgramService.getStudentsByProgramAndSemester(programId, semester);
        } else {
            response = studentProgramService.getStudentsByProgram(programId);
        }
        return ResponseEntity.ok(ApiResponse.success(response, "Student program roster retrieved successfully"));
    }
}
