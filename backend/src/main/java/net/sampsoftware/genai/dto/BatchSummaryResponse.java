package net.sampsoftware.genai.dto;

import java.util.List;

public record BatchSummaryResponse(
        int successCount,
        int failureCount,
        List<Long> summaryIds,  // Add summaryIds field
        String message          // Add message field
) {}
