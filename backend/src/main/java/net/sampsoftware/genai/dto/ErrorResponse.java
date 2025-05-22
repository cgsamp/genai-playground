package net.sampsoftware.genai.dto;

import java.time.Instant;

public record ErrorResponse(
        String error,
        String message,
        String timestamp,
        String path
) {
    public static ErrorResponse of(String error, String message, String path) {
        return new ErrorResponse(error, message,
                Instant.now().toString(), path);
    }
}
