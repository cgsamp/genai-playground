package net.sampsoftware.genai.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class GenaiException extends RuntimeException {
    private final HttpStatus httpStatus;
    private final String errorCode;

    public GenaiException(String message) {
        this(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public GenaiException(String message, HttpStatus httpStatus) {
        this(message, httpStatus, null);
    }

    public GenaiException(String message, HttpStatus httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }

    public GenaiException(String message, Throwable cause) {
        this(message, cause, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public GenaiException(String message, Throwable cause, HttpStatus httpStatus) {
        this(message, cause, httpStatus, null);
    }

    public GenaiException(String message, Throwable cause, HttpStatus httpStatus, String errorCode) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }
}