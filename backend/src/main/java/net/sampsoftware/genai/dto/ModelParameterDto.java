package net.sampsoftware.genai.dto;

/**
 * Data Transfer Object for model parameters using Java 17+ record
 */
public record ModelParameterDto(
        Long id,
        Long modelId,
        String paramName,
        String description,
        String dataType,
        String minValue,
        String maxValue,
        String defaultValue,
        Integer displayOrder
) {}
