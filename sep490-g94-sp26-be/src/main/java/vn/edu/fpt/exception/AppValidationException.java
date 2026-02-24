package vn.edu.fpt.exception;

import lombok.Getter;

import java.util.Map;

@Getter
public class AppValidationException extends RuntimeException {
    private final Map<String, String> fieldErrors;

    public AppValidationException(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
