package net.sampsoftware.genai.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Data
public class DirectModelCallRequest {
    
    @NotNull(message = "Model configuration ID is required")
    private Long modelConfigurationId;
    
    @NotBlank(message = "Prompt is required")
    private String prompt;
}