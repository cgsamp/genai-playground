package net.sampsoftware.genai.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PromptTypeDto {
    private Integer id;
    private String promptType;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}