package net.sampsoftware.genai.exception;

import org.springframework.http.HttpStatus;

public class ValidationException extends GenaiException {
    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    public ValidationException(String field, Object value) {
        super(String.format("Invalid value '%s' for field '%s'", value, field), 
              HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }
}