package com.unipulse.unipulse_backend.analytics.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "dim_student", schema = "unipulse_analytics")
public class DimStudentEntity {

    @Id
    @Column(name = "student_key", nullable = false)
    private UUID studentKey;

    @Column(name = "student_number", nullable = false, unique = true, length = 30)
    private String studentNumber;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "program_name", length = 150)
    private String programName;

    @Column(name = "department_name", length = 150)
    private String departmentName;

    @Column(name = "faculty_name", length = 150)
    private String facultyName;

    @Column(name = "enrollment_year", nullable = false)
    private Integer enrollmentYear;

    @Column(name = "current_gpa", precision = 3, scale = 2)
    private BigDecimal currentGpa;

    @Column(name = "academic_status", length = 30)
    private String academicStatus;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public DimStudentEntity() {}

    public UUID getStudentKey() { return studentKey; }
    public void setStudentKey(UUID studentKey) { this.studentKey = studentKey; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public Integer getEnrollmentYear() { return enrollmentYear; }
    public void setEnrollmentYear(Integer enrollmentYear) { this.enrollmentYear = enrollmentYear; }

    public BigDecimal getCurrentGpa() { return currentGpa; }
    public void setCurrentGpa(BigDecimal currentGpa) { this.currentGpa = currentGpa; }

    public String getAcademicStatus() { return academicStatus; }
    public void setAcademicStatus(String academicStatus) { this.academicStatus = academicStatus; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
