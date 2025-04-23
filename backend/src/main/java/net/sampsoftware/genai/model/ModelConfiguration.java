package net.sampsoftware.genai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_configuration")
public class ModelConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id")
    private Model model;

    @Column(columnDefinition = "jsonb")
    private String modelConfig;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private LocalDateTime createdAt;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Model getModel() { return model; }
    public void setModel(Model model) { this.model = model; }
    public String getModelConfig() { return modelConfig; }
    public void setModelConfig(String modelConfig) { this.modelConfig = modelConfig; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
