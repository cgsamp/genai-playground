package net.sampsoftware.genai.dto;

import java.time.LocalDateTime;

public class SummaryDto {
    private Long id;
    private Long entityId;
    private String summary;
    private String modelName;
    private LocalDateTime createdAt;

    public SummaryDto(Long id, Long entityId, String summary, String modelName, LocalDateTime createdAt) {
        this.id = id;
        this.entityId = entityId;
        this.summary = summary;
        this.modelName = modelName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
