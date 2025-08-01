package net.sampsoftware.genai.exception;

import org.springframework.http.HttpStatus;

public class ModelNotFoundException extends GenaiException {
    public ModelNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "MODEL_NOT_FOUND");
    }

    public ModelNotFoundException(Long modelId) {
        super(String.format("Model configuration with ID %d not found", modelId), 
              HttpStatus.NOT_FOUND, "MODEL_NOT_FOUND");
    }
}