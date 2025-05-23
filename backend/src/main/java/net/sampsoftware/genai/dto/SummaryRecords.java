package net.sampsoftware.genai.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

public class SummaryRecords {

    public record SummaryRecord(
            Long id,
            Long itemId,           // Changed from entityId
            String content,
            LocalDateTime createdAt
    ) {}

    public record DetailedSummaryRecord(
            Long id,
            Long itemId,           // Changed from entityId
            String itemName,       // Simplified from entityName
            String itemDetails,    // Simplified from entityDetails
            String content,
            String modelName,
            String modelProvider,
            Long modelId,
            Long modelConfigurationId,
            JsonNode modelConfig,
            String configComment,
            LocalDateTime createdAt
    ) {}
}
