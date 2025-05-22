package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record OperationResponse(
        String operationId,
        String status,
        String message,
        JsonNode results
) {}
