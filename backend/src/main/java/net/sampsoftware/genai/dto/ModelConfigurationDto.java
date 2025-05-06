package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.Instant;

@Data
public class ModelConfigurationDto {
    private Long id;
    private Long modelId;
    private String modelName;
    private String modelProvider;
    private JsonNode modelConfig;
    private String comment;
    private Instant createdAt;
}
