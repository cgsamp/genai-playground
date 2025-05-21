package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PersonRecord(
        Long id,
        String name,
        String email,
        LocalDate birthDate,
        String occupation,
        JsonNode attributes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
