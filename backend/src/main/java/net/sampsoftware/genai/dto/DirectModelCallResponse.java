package net.sampsoftware.genai.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DirectModelCallResponse {
    
    private String response;
    private Long modelCallId;
    private boolean success;
    private String errorMessage;
}