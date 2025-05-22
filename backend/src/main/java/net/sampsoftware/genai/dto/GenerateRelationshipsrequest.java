package net.sampsoftware.genai.dto;

import java.util.List;

public record GenerateRelationshipsRequest(
        Long modelConfigurationId,
        Long collectionId,
        List<String> relationshipTypes
) {}
