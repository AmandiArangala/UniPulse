package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.BatchRegistrationResponseDto;
import com.unipulse.unipulse_backend.dto.student.BatchStudentCsvRowDto;
import com.unipulse.unipulse_backend.dto.student.StudentProgramResponseDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.model.entity.Program;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.entity.User;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import com.unipulse.unipulse_backend.model.enums.UserRole;
import com.unipulse.unipulse_backend.repository.ProgramRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.repository.UserRepository;
import com.unipulse.unipulse_backend.service.BatchRegistrationService;
import com.unipulse.unipulse_backend.util.CsvParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BatchRegistrationServiceImpl implements BatchRegistrationService {

    private static final String DEFAULT_STUDENT_PASSWORD = "StudentPassword123!";

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ProgramRepository programRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public BatchRegistrationResponseDto processBatchRegistrationFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file is empty or missing");
        }
        try (InputStream inputStream = file.getInputStream()) {
            return processBatchRegistration(inputStream);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Error processing CSV upload: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public BatchRegistrationResponseDto processBatchRegistration(InputStream inputStream) {
        List<BatchStudentCsvRowDto> parsedRows = CsvParserUtil.parseStudentRegistrationCsv(inputStream);

        int total = parsedRows.size();
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();
        List<StudentProgramResponseDto> registeredStudents = new ArrayList<>();

        for (int i = 0; i < parsedRows.size(); i++) {
            BatchStudentCsvRowDto row = parsedRows.get(i);
            int rowNum = i + 2; // Accounting for 1-indexed header

            try {
                // 1. Validate duplicates
                if (userRepository.existsByUsername(row.getUsername())) {
                    throw new BadRequestException("Username '" + row.getUsername() + "' is already taken");
                }
                if (userRepository.existsByEmail(row.getEmail())) {
                    throw new BadRequestException("Email '" + row.getEmail() + "' is already registered");
                }
                if (studentRepository.existsByStudentNumber(row.getStudentNumber())) {
                    throw new BadRequestException("Student number '" + row.getStudentNumber() + "' already exists");
                }

                // 2. Validate program existence
                Optional<Program> programOpt = programRepository.findByCode(row.getProgramCode());
                if (programOpt.isEmpty()) {
                    throw new BadRequestException("Academic Program with code '" + row.getProgramCode() + "' not found");
                }
                Program program = programOpt.get();

                // 3. Create User account
                User user = User.builder()
                        .username(row.getUsername())
                        .email(row.getEmail())
                        .passwordHash(passwordEncoder.encode(DEFAULT_STUDENT_PASSWORD))
                        .firstName(row.getFirstName())
                        .lastName(row.getLastName())
                        .role(UserRole.STUDENT)
                        .isActive(true)
                        .build();

                User savedUser = userRepository.save(user);

                // 4. Create Student profile
                Student student = Student.builder()
                        .user(savedUser)
                        .studentNumber(row.getStudentNumber())
                        .program(program)
                        .currentSemester(1)
                        .gpa(BigDecimal.ZERO)
                        .academicStatus(AcademicStatus.GOOD_STANDING)
                        .enrollmentYear(row.getEnrollmentYear())
                        .build();

                Student savedStudent = studentRepository.save(student);
                successCount++;

                registeredStudents.add(StudentProgramResponseDto.builder()
                        .studentId(savedStudent.getUserId())
                        .studentNumber(savedStudent.getStudentNumber())
                        .studentName(savedUser.getFirstName() + " " + savedUser.getLastName())
                        .email(savedUser.getEmail())
                        .programId(program.getId())
                        .programCode(program.getCode())
                        .programName(program.getName())
                        .currentSemester(savedStudent.getCurrentSemester())
                        .gpa(savedStudent.getGpa())
                        .academicStatus(savedStudent.getAcademicStatus())
                        .enrollmentYear(savedStudent.getEnrollmentYear())
                        .build());

            } catch (Exception e) {
                failureCount++;
                errors.add("Row " + rowNum + " (" + row.getStudentNumber() + "): " + e.getMessage());
            }
        }

        return BatchRegistrationResponseDto.builder()
                .totalProcessed(total)
                .successCount(successCount)
                .failureCount(failureCount)
                .errors(errors)
                .registeredStudents(registeredStudents)
                .build();
    }
}
