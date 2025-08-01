package net.sampsoftware.genai.exception;

import org.springframework.http.HttpStatus;

public class ModelApiException extends GenaiException {
    public ModelApiException(String message) {
        super(message, HttpStatus.BAD_GATEWAY, "MODEL_API_ERROR");
    }

    public ModelApiException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_GATEWAY, "MODEL_API_ERROR");
    }

    public ModelApiException(String modelId, Exception cause) {
        super(String.format("Failed to communicate with model API for model: %s", modelId), 
              cause, HttpStatus.BAD_GATEWAY, "MODEL_API_ERROR");
    }
}