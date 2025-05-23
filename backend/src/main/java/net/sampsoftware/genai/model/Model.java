package net.sampsoftware.genai.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "model",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "model_name_provider_unique",
                        columnNames = {"modelName", "modelProvider"}
                )
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_name", nullable = false, length = 200)
    private String modelName;

    @Column(name = "model_provider", nullable = false, length = 200)
    private String modelProvider;

    @Column(name = "model_api_url", length = 500)  // Increased from 200 to 500
    private String modelApiUrl;

    @Column(name = "comment", columnDefinition = "text")
    private String comment;
}
