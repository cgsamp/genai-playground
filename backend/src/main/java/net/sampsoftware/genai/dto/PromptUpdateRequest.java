package net.sampsoftware.genai.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class PromptUpdateRequest {
    
    @NotBlank(message = "Prompt name is required")
    private String name;
    
    @NotBlank(message = "Prompt text is required")
    private String text;
    
    @NotNull(message = "Prompt type ID is required")
    private Integer typeId;
}