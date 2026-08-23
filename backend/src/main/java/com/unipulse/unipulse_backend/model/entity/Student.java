package com.unipulse.unipulse_backend.model.entity;

import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "students", schema = "unipulse_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "student_number", nullable = false, unique = true, length = 30)
    private String studentNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @Builder.Default
    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester = 1;

    @Builder.Default
    @Column(precision = 3, scale = 2)
    private BigDecimal gpa = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_status", length = 30)
    private AcademicStatus academicStatus;

    @Column(name = "enrollment_year", nullable = false)
    private Integer enrollmentYear;
}
