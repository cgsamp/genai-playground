package net.sampsoftware.genai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "relationships")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Relationship extends BaseEntity {
    @Column(name = "relationship_type", nullable = false)
    private String relationshipType;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "source_id", nullable = false)
    private Long sourceId;

    @Column(name = "target_type", nullable = false)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;
}
