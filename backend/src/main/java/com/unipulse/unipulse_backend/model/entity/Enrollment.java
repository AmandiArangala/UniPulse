package com.unipulse.unipulse_backend.model.entity;

import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "enrollments", schema = "unipulse_core", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "module_id", "semester_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "final_grade", precision = 5, scale = 2)
    private BigDecimal finalGrade;

    @Column(name = "letter_grade", length = 5)
    private String letterGrade;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(length = 20, nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

    @Column(name = "enrolled_at", insertable = false, updatable = false)
    private OffsetDateTime enrolledAt;
}
