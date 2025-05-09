package net.sampsoftware.genai.dto;

import java.time.LocalDateTime;

public record EntitySummaryDto(
    Long id,
    Long entityId,
    String summary,
    String modelName,
    LocalDateTime createdAt
) {}