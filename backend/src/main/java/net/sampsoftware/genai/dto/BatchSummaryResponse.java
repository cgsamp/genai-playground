package net.sampsoftware.genai.dto;

public record BatchSummaryResponse(
    int successCount,
    int failureCount
) {}