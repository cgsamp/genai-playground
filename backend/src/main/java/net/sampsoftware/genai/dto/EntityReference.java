package net.sampsoftware.genai.dto;

/**
 * A record representing a reference to any entity by its type and ID.
 */
public record EntityReference(
        String entityType,
        Long entityId,
        String name
) {}
