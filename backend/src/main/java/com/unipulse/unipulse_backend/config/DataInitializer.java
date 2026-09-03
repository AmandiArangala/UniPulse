package com.unipulse.unipulse_backend.config;

import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import com.unipulse.unipulse_backend.model.enums.UserRole;
import com.unipulse.unipulse_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;

    @Override
    public void run(String... args) {
        log.info("Checking & auto-provisioning missing student/lecturer profiles for registered users...");
        syncUnprovisionedUsers();
    }

    public void syncUnprovisionedUsers() {
        Faculty faculty = facultyRepository.findAll().stream().findFirst()
                .orElseGet(() -> facultyRepository.save(Faculty.builder()
                        .code("FCS")
                        .name("Faculty of Computer Science & IT")
                        .build()));

        Department department = departmentRepository.findAll().stream().findFirst()
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .code("CS")
                        .name("Department of Computer Science")
                        .faculty(faculty)
                        .build()));

        Program program = programRepository.findAll().stream().findFirst()
                .orElseGet(() -> programRepository.save(Program.builder()
                        .code("BSc-SE")
                        .name("BSc (Hons) in Software Engineering")
                        .department(department)
                        .degreeLevel("BACHELOR")
                        .totalCredits(120)
                        .build()));

        for (User user : userRepository.findAll()) {
            if (user.getRole() == UserRole.STUDENT && !studentRepository.existsById(user.getId())) {
                String studentNum = "STU-2026-" + String.format("%04d", (int) (Math.random() * 9000 + 1000));
                Student student = Student.builder()
                        .user(user)
                        .studentNumber(studentNum)
                        .program(program)
                        .currentSemester(1)
                        .gpa(BigDecimal.ZERO)
                        .academicStatus(AcademicStatus.GOOD_STANDING)
                        .enrollmentYear(2026)
                        .build();
                studentRepository.save(student);
                log.info("Auto-synced Student profile for existing user: {} -> {}", user.getEmail(), studentNum);
            } else if (user.getRole() == UserRole.LECTURER && !lecturerRepository.existsById(user.getId())) {
                String empNum = "LEC-2026-" + String.format("%04d", (int) (Math.random() * 9000 + 1000));
                Lecturer lecturer = Lecturer.builder()
                        .user(user)
                        .employeeNumber(empNum)
                        .department(department)
                        .academicTitle("Lecturer")
                        .build();
                lecturerRepository.save(lecturer);
                log.info("Auto-synced Lecturer profile for existing user: {} -> {}", user.getEmail(), empNum);
            }
        }
    }
}
