package net.sampsoftware.genai.dto;

import lombok.Data;

@Data
public class ModelDto {
    private Long id;
    private String modelName;
    private String modelProvider;
    private String modelApiUrl;
    private String comment;
}
