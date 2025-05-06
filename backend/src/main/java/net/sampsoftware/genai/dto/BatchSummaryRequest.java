package net.sampsoftware.genai.dto;

public record BatchSummaryRequest(
    Long modelConfigurationId,
    String prompt
) {}
