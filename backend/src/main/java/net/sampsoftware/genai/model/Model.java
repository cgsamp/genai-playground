package net.sampsoftware.genai.model;

import jakarta.persistence.*;

@Entity
@Table(name = "model")
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modelName;
    private String modelProvider;
    private String modelApiUrl;

    @Column(columnDefinition = "TEXT")
    private String comment;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public String getModelProvider() { return modelProvider; }
    public void setModelProvider(String modelProvider) { this.modelProvider = modelProvider; }
    public String getModelApiUrl() { return modelApiUrl; }
    public void setModelApiUrl(String modelApiUrl) { this.modelApiUrl = modelApiUrl; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
