package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

public record RelationshipRecord(
        Long id,
        String name,
        String relationshipType,
        String sourceType,
        Long sourceId,
        String targetType,
        Long targetId,
        JsonNode attributes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
