package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record OperationRequest(
        String operationId,
        Long modelConfigurationId,
        Long collectionId,
        JsonNode parameters
) {}
