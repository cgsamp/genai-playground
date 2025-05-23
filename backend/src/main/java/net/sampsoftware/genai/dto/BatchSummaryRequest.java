package net.sampsoftware.genai.dto;

import java.util.List;

public record BatchSummaryRequest(
        Long modelConfigurationId,
        String prompt,
        List<String> itemTypes  // Add itemTypes field
) {}
