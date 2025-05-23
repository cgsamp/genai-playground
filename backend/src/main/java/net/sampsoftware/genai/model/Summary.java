package net.sampsoftware.genai.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicUpdate
public class Summary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_configuration_id")
    private ModelConfiguration modelConfiguration;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Column(name = "batch_id")
    private Long batchId;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode metadata;

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
    public Long getModelConfigurationId() {
        return modelConfiguration != null ? modelConfiguration.getId() : null;
    }

    /**
     * Check if this summary has metadata
     */
    public boolean hasMetadata() {
        return metadata != null && !metadata.isNull() && metadata.size() > 0;
    }

    /**
     * Get a metadata field value
     */
    public String getMetadataField(String field) {
        if (metadata == null || !metadata.has(field)) {
            return null;
        }
        return metadata.get(field).asText();
    }

}
