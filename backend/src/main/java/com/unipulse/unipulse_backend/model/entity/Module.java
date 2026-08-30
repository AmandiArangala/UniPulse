package com.unipulse.unipulse_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "modules", schema = "unipulse_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 150)
    private String title;

    @Builder.Default
    @Column(name = "credit_hours", nullable = false)
    private Integer creditHours = 3;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.Set<ModulePrerequisite> prerequisites = new java.util.HashSet<>();

    public java.math.BigDecimal getCreditHoursDecimal() {
        return creditHours != null ? new java.math.BigDecimal(creditHours) : new java.math.BigDecimal("3.0");
    }

    public boolean isGpaModule() {
        // Non-GPA courses (e.g. English IS 1011 or general non-gpa codes)
        if (code != null && (code.startsWith("IS") || code.toUpperCase().contains("NGPA"))) {
            return false;
        }
        return true;
    }

    public java.math.BigDecimal getCaWeightPercentage() {
        if (code != null && code.startsWith("IN 1901")) {
            return new java.math.BigDecimal("100.00");
        } else if (code != null && code.startsWith("IN 1311")) {
            return new java.math.BigDecimal("40.00");
        } else if (code != null && code.startsWith("IS 1011")) {
            return new java.math.BigDecimal("50.00");
        }
        return new java.math.BigDecimal("30.00");
    }

    public java.math.BigDecimal getWeWeightPercentage() {
        return new java.math.BigDecimal("100.00").subtract(getCaWeightPercentage());
    }
}


