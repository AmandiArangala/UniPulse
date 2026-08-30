package com.unipulse.unipulse_backend.model.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_events", schema = "unipulse_core", indexes = {
    @Index(name = "idx_learning_events_student", columnList = "student_id"),
    @Index(name = "idx_learning_events_module", columnList = "module_id"),
    @Index(name = "idx_learning_events_type", columnList = "event_type"),
    @Index(name = "idx_learning_events_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "event_source", nullable = false, length = 50)
    private String eventSource;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private JsonNode payload;
}
