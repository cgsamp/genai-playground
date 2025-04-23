package net.sampsoftware.genai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entity_summary")
public class EntitySummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_configuration_id")
    private ModelConfiguration modelConfiguration;

    private String entity;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private LocalDateTime createdAt;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ModelConfiguration getModelConfiguration() { return modelConfiguration; }
    public void setModelConfiguration(ModelConfiguration modelConfiguration) { this.modelConfiguration = modelConfiguration; }
    public String getEntity() { return entity; }
    public void setEntity(String entity) { this.entity = entity; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
