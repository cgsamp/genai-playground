package net.sampsoftware.genai.dto;

public record ModelCallRequest(
    Long modelConfigurationId,
    String prompt
) {}
