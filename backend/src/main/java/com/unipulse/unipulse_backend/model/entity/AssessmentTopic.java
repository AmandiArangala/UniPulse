package com.unipulse.unipulse_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "assessment_topics", schema = "unipulse_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(name = "topic_name", nullable = false, length = 150)
    private String topicName;

    @Column(name = "weight_contribution", precision = 5, scale = 2)
    private BigDecimal weightContribution;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
