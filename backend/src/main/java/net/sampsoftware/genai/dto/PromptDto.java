package net.sampsoftware.genai.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PromptDto {
    private Integer id;
    private String name;
    private String text;
    private PromptTypeDto type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedDate;
    private boolean deleted;
}