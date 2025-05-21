package net.sampsoftware.genai.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "summaries") // Keep table name for DB compatibility
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@DynamicUpdate
public class Summary extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_configuration_id")
    private ModelConfiguration modelConfiguration;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Column(name = "batch_id")
    private Long batchId;

    // Custom getter for model configuration ID
    public Long getModelConfigurationId() {
        return modelConfiguration != null ? modelConfiguration.getId() : null;
    }

    // Manual builder pattern to work with inheritance
    @Builder
    public Summary(Long id, String name, ModelConfiguration modelConfiguration,
                   String entityType, Long entityId, String content, Long batchId) {
        super();
        this.setId(id);
        this.setName(name); // Name from BaseEntity
        this.modelConfiguration = modelConfiguration;
        this.entityType = entityType;
        this.entityId = entityId;
        this.content = content;
        this.batchId = batchId;
    }

    // Helper method to get entity name (alias for base entity name)
    public String getEntityName() {
        return getName();
    }

    // Helper method to set entity name (alias for base entity name)
    public void setEntityName(String entityName) {
        setName(entityName);
    }

    // Helper method to get entity details (stored in attributes)
    public String getEntityDetails() {
        return getAttributes().has("details") ?
                getAttributes().get("details").asText() : null;
    }

    // Helper method to set entity details (stored in attributes)
    public void setEntityDetails(String details) {
        ((com.fasterxml.jackson.databind.node.ObjectNode) getAttributes())
                .put("details", details);
    }
}
