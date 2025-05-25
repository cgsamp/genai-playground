package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;

/**
 * Complete DTO for ModelCall data - includes all fields for debugging and analysis
 */
public record ModelCallRecord(
        Long id,
        Long modelConfigurationId,
        JsonNode modelConfigurationJson,
        String provider,
        String promptText,
        JsonNode promptJson,
        String responseText,
        JsonNode responseJson,
        JsonNode tokenUsage,
        JsonNode chatOptions,
        JsonNode metadata,
        Boolean success,
        String errorMessage,
        String errorClass,
        String errorStacktrace,
        Instant startTime,
        Instant endTime,
        Long durationMs,
        Long apiDurationMs,
        Long processingDurationMs,
        Long batchId,
        Instant createdAt,
        String modelName,
        String modelProvider,
        String correlationId,
        String userId,
        String requestContext
) {
    /**
     * Check if this was a successful call
     */
    public boolean wasSuccessful() {
        return success != null && success;
    }

    /**
     * Get formatted duration
     */
    public String getFormattedDuration() {
        if (durationMs == null) return "Unknown";
        if (durationMs < 1000) return durationMs + "ms";
        return String.format("%.2fs", durationMs / 1000.0);
    }

    /**
     * Get performance breakdown
     */
    public String getPerformanceBreakdown() {
        if (apiDurationMs == null || processingDurationMs == null) {
            return getFormattedDuration();
        }
        return String.format("Total: %s (API: %dms, Processing: %dms)",
                getFormattedDuration(), apiDurationMs, processingDurationMs);
    }

    /**
     * Get model display name
     */
    public String getModelDisplayName() {
        if (modelName != null && modelProvider != null) {
            return modelName + " (" + modelProvider + ")";
        }
        if (modelName != null) return modelName;
        if (provider != null) return provider;
        return "Unknown Model";
    }

    /**
     * Check if call has error details
     */
    public boolean hasError() {
        return !wasSuccessful() && (errorMessage != null || errorClass != null);
    }

    /**
     * Get summary of token usage if available
     */
    public String getTokenUsageSummary() {
        if (tokenUsage == null) return null;

        StringBuilder summary = new StringBuilder();
        if (tokenUsage.has("promptTokens")) {
            summary.append("Prompt: ").append(tokenUsage.get("promptTokens").asInt());
        }
        if (tokenUsage.has("completionTokens")) {
            if (summary.length() > 0) summary.append(", ");
            summary.append("Completion: ").append(tokenUsage.get("completionTokens").asInt());
        }
        if (tokenUsage.has("totalTokens")) {
            if (summary.length() > 0) summary.append(", ");
            summary.append("Total: ").append(tokenUsage.get("totalTokens").asInt());
        }

        return summary.length() > 0 ? summary.toString() : null;
    }
}
