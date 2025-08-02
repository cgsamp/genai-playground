package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;

public record ModelConfigurationDto(
        Long id,
        Long modelId,
        String modelName,
        String modelProvider,
        JsonNode modelConfig,
        String comment,
        Instant createdAt,
        Double costPer1kInputTokens,
        Double costPer1kOutputTokens,
        Integer contextLength
) {}
