package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

public record RelationshipRecord(
        Long id,
        String name,
        String relationshipType,
        Long sourceItemId,      // Changed from sourceType/sourceId
        Long targetItemId,      // Changed from targetType/targetId
        JsonNode attributes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
