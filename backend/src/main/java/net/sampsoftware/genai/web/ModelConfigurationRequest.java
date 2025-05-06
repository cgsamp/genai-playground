package net.sampsoftware.genai.web;

import com.fasterxml.jackson.databind.JsonNode;

public record ModelConfigurationRequest(
        Long modelId,
        JsonNode modelConfig,
        String comment
) {}
