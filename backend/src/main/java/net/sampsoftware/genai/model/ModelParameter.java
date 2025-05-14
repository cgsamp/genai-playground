package net.sampsoftware.genai.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "model_parameter")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelParameter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id")
    private Model model;
    
    private String paramName;
    private String description;
    private String dataType; // e.g., "number", "string"
    private String minValue;
    private String maxValue;
    private String defaultValue;
    private Integer displayOrder;
}