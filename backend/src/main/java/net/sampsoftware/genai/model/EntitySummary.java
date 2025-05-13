package net.sampsoftware.genai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "entity_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntitySummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_configuration_id")
    private ModelConfiguration modelConfiguration;
    
    @Column(name = "type")
    private String type;
    
    @Column(name = "entity_id")
    private Long entityId;
    
    @Column(name = "summary", columnDefinition = "text")
    private String summary;
    
    @Column(name = "created_at")
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
    
    @Column(name = "batch_id")
    private Long batchId;

    public Long getModelConfigurationId() {
        return modelConfiguration != null ? modelConfiguration.getId() : null;
    }
}
