package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.enrollment.EnrollmentStatusUpdateRequestDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentResponseDto;
import com.unipulse.unipulse_backend.exception.CreditCapExceededException;
import com.unipulse.unipulse_backend.exception.DuplicateEnrollmentException;
import com.unipulse.unipulse_backend.exception.InvalidEnrollmentStatusException;
import com.unipulse.unipulse_backend.exception.PrerequisiteNotMetException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Enrollment;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.ModulePrerequisite;
import com.unipulse.unipulse_backend.model.entity.Semester;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import com.unipulse.unipulse_backend.repository.EnrollmentRepository;
import com.unipulse.unipulse_backend.repository.ModulePrerequisiteRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.SemesterRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.ModuleEnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleEnrollmentServiceImpl implements ModuleEnrollmentService {

    public static final int MAX_SEMESTER_CREDITS = 21;

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ModuleRepository moduleRepository;
    private final SemesterRepository semesterRepository;
    private final ModulePrerequisiteRepository modulePrerequisiteRepository;

    @Override
    @Transactional
    public ModuleEnrollmentResponseDto enrollStudentInModule(ModuleEnrollmentRequestDto request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", request.getModuleId()));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", request.getSemesterId()));

        // 1. Prevent duplicate active enrollments
        boolean isAlreadyEnrolled = enrollmentRepository.existsByStudentUserIdAndModuleIdAndSemesterIdAndStatusIn(
                request.getStudentId(),
                request.getModuleId(),
                request.getSemesterId(),
                List.of(EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED)
        );

        if (isAlreadyEnrolled) {
            throw new DuplicateEnrollmentException(String.format(
                    "Student %s is already registered or has completed module %s in semester %s",
                    student.getStudentNumber(), module.getCode(), semester.getName()
            ));
        }

        // 2. Validate mandatory prerequisites
        List<ModulePrerequisite> prerequisites = modulePrerequisiteRepository.findByModuleId(request.getModuleId());
        for (ModulePrerequisite prereq : prerequisites) {
            if (Boolean.TRUE.equals(prereq.getIsMandatory())) {
                UUID prereqId = prereq.getPrerequisiteModule().getId();
                boolean completed = enrollmentRepository.hasStudentCompletedModule(request.getStudentId(), prereqId);
                if (!completed) {
                    throw new PrerequisiteNotMetException(String.format(
                            "Prerequisite requirement not met: Module %s (%s) must be completed before registering for %s",
                            prereq.getPrerequisiteModule().getCode(),
                            prereq.getPrerequisiteModule().getTitle(),
                            module.getCode()
                    ));
                }
            }
        }

        // 3. Validate semester credit hour caps (default: 21 credits max)
        Integer currentEnrolledCredits = enrollmentRepository.sumCreditHoursByStudentAndSemesterAndStatusIn(
                request.getStudentId(),
                request.getSemesterId(),
                List.of(EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED)
        );

        if (currentEnrolledCredits == null) {
            currentEnrolledCredits = 0;
        }

        int requestedCredits = module.getCreditHours() != null ? module.getCreditHours() : 3;
        if (currentEnrolledCredits + requestedCredits > MAX_SEMESTER_CREDITS) {
            throw new CreditCapExceededException(String.format(
                    "Cannot enroll in module %s (%d credits). Total credits (%d) would exceed maximum limit of %d credits per semester.",
                    module.getCode(), requestedCredits, currentEnrolledCredits + requestedCredits, MAX_SEMESTER_CREDITS
            ));
        }

        // 4. Save new enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .module(module)
                .semester(semester)
                .status(EnrollmentStatus.ENROLLED)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return mapToResponseDto(savedEnrollment);
    }

    @Override
    @Transactional
    public ModuleEnrollmentResponseDto dropModule(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new InvalidEnrollmentStatusException("Cannot drop a module that has already been marked COMPLETED");
        }
        if (enrollment.getStatus() == EnrollmentStatus.DROPPED) {
            throw new InvalidEnrollmentStatusException("Module is already in DROPPED status");
        }

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return mapToResponseDto(updatedEnrollment);
    }

    @Override
    @Transactional
    public ModuleEnrollmentResponseDto withdrawFromModule(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new InvalidEnrollmentStatusException("Cannot withdraw from a module that is already COMPLETED");
        }
        if (enrollment.getStatus() == EnrollmentStatus.WITHDRAWN) {
            throw new InvalidEnrollmentStatusException("Module is already in WITHDRAWN status");
        }

        enrollment.setStatus(EnrollmentStatus.WITHDRAWN);
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return mapToResponseDto(updatedEnrollment);
    }

    @Override
    @Transactional
    public ModuleEnrollmentResponseDto updateEnrollmentStatus(UUID enrollmentId, EnrollmentStatusUpdateRequestDto request) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        if (request.getStatus() != null) {
            enrollment.setStatus(request.getStatus());
        }
        if (request.getFinalGrade() != null) {
            enrollment.setFinalGrade(request.getFinalGrade());
        }
        if (request.getLetterGrade() != null) {
            enrollment.setLetterGrade(request.getLetterGrade());
        }

        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return mapToResponseDto(updatedEnrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleEnrollmentResponseDto getEnrollmentById(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));
        return mapToResponseDto(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleEnrollmentResponseDto> getStudentEnrollments(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return enrollmentRepository.findByStudentUserId(studentId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleEnrollmentResponseDto> getStudentSemesterEnrollments(UUID studentId, UUID semesterId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        if (!semesterRepository.existsById(semesterId)) {
            throw new ResourceNotFoundException("Semester", "id", semesterId);
        }
        return enrollmentRepository.findByStudentUserIdAndSemesterId(studentId, semesterId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleEnrollmentResponseDto> getModuleEnrollments(UUID moduleId, UUID semesterId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Module", "id", moduleId);
        }
        if (!semesterRepository.existsById(semesterId)) {
            throw new ResourceNotFoundException("Semester", "id", semesterId);
        }
        return enrollmentRepository.findByModuleIdAndSemesterId(moduleId, semesterId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleEnrollmentResponseDto> getStudentEnrollmentsByStatus(UUID studentId, EnrollmentStatus status) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return enrollmentRepository.findByStudentUserIdAndStatus(studentId, status).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleEnrollmentResponseDto> getActiveStudentEnrollments(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return enrollmentRepository.findByStudentUserIdAndStatus(studentId, EnrollmentStatus.ENROLLED).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private ModuleEnrollmentResponseDto mapToResponseDto(Enrollment enrollment) {
        String studentName = "";
        String studentNumber = "";
        if (enrollment.getStudent() != null) {
            studentNumber = enrollment.getStudent().getStudentNumber();
            if (enrollment.getStudent().getUser() != null) {
                studentName = enrollment.getStudent().getUser().getFirstName() + " " + enrollment.getStudent().getUser().getLastName();
            }
        }

        return ModuleEnrollmentResponseDto.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent() != null ? enrollment.getStudent().getUserId() : null)
                .studentNumber(studentNumber)
                .studentName(studentName)
                .moduleId(enrollment.getModule() != null ? enrollment.getModule().getId() : null)
                .moduleCode(enrollment.getModule() != null ? enrollment.getModule().getCode() : null)
                .moduleTitle(enrollment.getModule() != null ? enrollment.getModule().getTitle() : null)
                .creditHours(enrollment.getModule() != null ? enrollment.getModule().getCreditHours() : null)
                .semesterId(enrollment.getSemester() != null ? enrollment.getSemester().getId() : null)
                .semesterName(enrollment.getSemester() != null ? enrollment.getSemester().getName() : null)
                .finalGrade(enrollment.getFinalGrade())
                .letterGrade(enrollment.getLetterGrade())
                .status(enrollment.getStatus())
                .enrolledAt(enrollment.getEnrolledAt())
                .build();
    }
}
