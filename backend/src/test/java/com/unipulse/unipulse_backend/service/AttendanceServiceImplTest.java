package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.attendance.*;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.enums.AttendanceStatus;
import com.unipulse.unipulse_backend.repository.*;
import com.unipulse.unipulse_backend.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceImplTest {

    @Mock
    private AttendanceSessionRepository sessionRepository;

    @Mock
    private AttendanceRecordRepository recordRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private LecturerRepository lecturerRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private UUID moduleId;
    private UUID lecturerId;
    private UUID studentId;
    private UUID sessionId;
    private Module module;
    private Lecturer lecturer;
    private Student student;
    private User lecturerUser;
    private User studentUser;
    private AttendanceSession session;

    @BeforeEach
    void setUp() {
        moduleId = UUID.randomUUID();
        lecturerId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        sessionId = UUID.randomUUID();

        lecturerUser = User.builder()
                .id(lecturerId)
                .firstName("John")
                .lastName("Doe")
                .build();

        lecturer = Lecturer.builder()
                .userId(lecturerId)
                .user(lecturerUser)
                .employeeNumber("EMP001")
                .build();

        studentUser = User.builder()
                .id(studentId)
                .firstName("Alice")
                .lastName("Smith")
                .build();

        student = Student.builder()
                .userId(studentId)
                .user(studentUser)
                .studentNumber("STU1001")
                .build();

        module = Module.builder()
                .id(moduleId)
                .code("CS101")
                .title("Software Engineering")
                .build();

        session = AttendanceSession.builder()
                .id(sessionId)
                .module(module)
                .lecturer(lecturer)
                .sessionDate(LocalDate.now())
                .topic("Design Patterns")
                .build();
    }

    @Test
    @DisplayName("Should create attendance session successfully")
    void createSession_Success() {
        AttendanceSessionRequestDto request = AttendanceSessionRequestDto.builder()
                .moduleId(moduleId)
                .lecturerId(lecturerId)
                .sessionDate(LocalDate.now())
                .topic("Design Patterns")
                .build();

        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(lecturerRepository.findById(lecturerId)).thenReturn(Optional.of(lecturer));
        when(sessionRepository.save(any(AttendanceSession.class))).thenReturn(session);

        AttendanceSessionResponseDto response = attendanceService.createSession(request);

        assertThat(response).isNotNull();
        assertThat(response.getModuleCode()).isEqualTo("CS101");
        assertThat(response.getLecturerName()).isEqualTo("John Doe");
        verify(sessionRepository, times(1)).save(any(AttendanceSession.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when module is not found")
    void createSession_ModuleNotFound_ThrowsException() {
        AttendanceSessionRequestDto request = AttendanceSessionRequestDto.builder()
                .moduleId(moduleId)
                .lecturerId(lecturerId)
                .sessionDate(LocalDate.now())
                .topic("Design Patterns")
                .build();

        when(moduleRepository.findById(moduleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> attendanceService.createSession(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should record bulk attendance successfully")
    void recordBulkAttendance_Success() {
        BulkAttendanceRecordRequestDto bulkDto = BulkAttendanceRecordRequestDto.builder()
                .sessionId(sessionId)
                .records(List.of(
                        AttendanceRecordEntryDto.builder()
                                .studentId(studentId)
                                .status(AttendanceStatus.PRESENT)
                                .remarks("On time")
                                .build()
                ))
                .build();

        AttendanceRecord record = AttendanceRecord.builder()
                .id(UUID.randomUUID())
                .session(session)
                .student(student)
                .status(AttendanceStatus.PRESENT)
                .remarks("On time")
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(recordRepository.findBySessionIdAndStudentUserId(sessionId, studentId)).thenReturn(Optional.empty());
        when(recordRepository.save(any(AttendanceRecord.class))).thenReturn(record);

        List<AttendanceRecordResponseDto> responseList = attendanceService.recordBulkAttendance(bulkDto);

        assertThat(responseList).hasSize(1);
        assertThat(responseList.get(0).getStatus()).isEqualTo(AttendanceStatus.PRESENT);
        verify(recordRepository, times(1)).save(any(AttendanceRecord.class));
    }

    @Test
    @DisplayName("Should calculate attendance summary with exam eligibility for >=80%")
    void calculateStudentAttendanceSummary_Eligible() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(sessionRepository.countByModuleId(moduleId)).thenReturn(10L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.PRESENT)).thenReturn(8L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.ABSENT)).thenReturn(1L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.LATE)).thenReturn(1L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.EXCUSED)).thenReturn(0L);

        AttendanceSummaryDto summary = attendanceService.calculateStudentAttendanceSummary(studentId, moduleId);

        assertThat(summary).isNotNull();
        assertThat(summary.getAttendancePercentage()).isEqualTo(85.0);
        assertThat(summary.isEligibleForExam()).isTrue();
    }

    @Test
    @DisplayName("Should flag exam ineligibility for attendance <80%")
    void calculateStudentAttendanceSummary_Ineligible() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(sessionRepository.countByModuleId(moduleId)).thenReturn(10L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.PRESENT)).thenReturn(5L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.ABSENT)).thenReturn(5L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.LATE)).thenReturn(0L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.EXCUSED)).thenReturn(0L);

        AttendanceSummaryDto summary = attendanceService.calculateStudentAttendanceSummary(studentId, moduleId);

        assertThat(summary).isNotNull();
        assertThat(summary.getAttendancePercentage()).isEqualTo(50.0);
        assertThat(summary.isEligibleForExam()).isFalse();
    }

    @Test
    @DisplayName("Should compute module level attendance analytics successfully")
    void calculateModuleAttendanceAnalytics_Success() {
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .module(module)
                .build();

        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(sessionRepository.countByModuleId(moduleId)).thenReturn(10L);
        when(enrollmentRepository.findByModuleId(moduleId)).thenReturn(List.of(enrollment));
        when(recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.PRESENT)).thenReturn(9L);
        when(recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.ABSENT)).thenReturn(1L);
        when(recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.LATE)).thenReturn(0L);
        when(recordRepository.countBySessionModuleIdAndStatus(moduleId, AttendanceStatus.EXCUSED)).thenReturn(0L);

        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.PRESENT)).thenReturn(9L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.LATE)).thenReturn(0L);
        when(recordRepository.countByStudentUserIdAndSessionModuleIdAndStatus(studentId, moduleId, AttendanceStatus.EXCUSED)).thenReturn(0L);

        ModuleAttendanceAnalyticsDto analytics = attendanceService.calculateModuleAttendanceAnalytics(moduleId);

        assertThat(analytics).isNotNull();
        assertThat(analytics.getTotalStudentsEnrolled()).isEqualTo(1L);
        assertThat(analytics.getAverageAttendancePercentage()).isEqualTo(90.0);
        assertThat(analytics.getLowAttendanceStudentsCount()).isEqualTo(0L);
    }
}
