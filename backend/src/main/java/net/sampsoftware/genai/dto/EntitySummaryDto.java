package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

public record EntitySummaryDto(
        Long id,
        Long entityId,
        String summary,
        String modelName,
        String modelProvider,
        Long modelId,
        Long modelConfigurationId,
        JsonNode modelConfig,
        String configComment,
        LocalDateTime createdAt
) {}
