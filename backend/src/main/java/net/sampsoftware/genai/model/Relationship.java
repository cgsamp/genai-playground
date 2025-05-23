package net.sampsoftware.genai.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "relationships")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicUpdate
public class Relationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "relationship_type", nullable = false)
    private String relationshipType;

    /**
     * Source Item ID - everything is now an Item
     */
    @Column(name = "source_item_id", nullable = false)
    private Long sourceItemId;

    /**
     * Target Item ID - everything is now an Item
     */
    @Column(name = "target_item_id", nullable = false)
    private Long targetItemId;

    /**
     * Optional name/description of this relationship
     */
    @Column(name = "name")
    private String name;

    /**
     * JSONB for relationship-specific attributes
     * Can store strength, confidence, metadata, etc.
     */
    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode attributes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Utility methods

    /**
     * Check if this relationship has attributes
     */
    public boolean hasAttributes() {
        return attributes != null && !attributes.isNull() && attributes.size() > 0;
    }

    /**
     * Get an attribute field value
     */
    public String getAttributeField(String field) {
        if (attributes == null || !attributes.has(field)) {
            return null;
        }
        return attributes.get(field).asText();
    }

    /**
     * Get numeric attribute value
     */
    public Double getNumericAttribute(String field) {
        if (attributes == null || !attributes.has(field)) {
            return null;
        }
        return attributes.get(field).asDouble();
    }
}
