package vn.edu.fpt.exception;

import vn.edu.fpt.dto.ApiResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@AllArgsConstructor
@ControllerAdvice
@Slf4j
public class AppExceptionHandler {

//    @ExceptionHandler(value = Exception.class)
//    ResponseEntity<ApiResponse<?>> handlingRuntimeException(RuntimeException e) {
//        log.error("Exception: ", e);
//        ERROR_CODE errorCode = ERROR_CODE.UNKNOWN_EXCEPTION;
//        ApiResponse<?> apiResponse = ApiResponse.builder()
//                .code(errorCode.getCode())
//                .message(errorCode.getMessage())
//                .build();
//        return ResponseEntity.badRequest().body(apiResponse);
//    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> handlingAppException(AppException e) {
        ERROR_CODE errorCode = e.getErrorCode();
        String message = e.getMessage() != null ? errorCode.getMessage() + e.getMessage() : errorCode.getMessage();
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(message)
                .data(null)
                .build();

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<?>> handlingAccessDeniedException(AccessDeniedException e) {
        log.error("Exception: ", e);
        ERROR_CODE errorCode = ERROR_CODE.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<?>> handlingValidation(MethodArgumentNotValidException ex) {
        log.error("Exception: ", ex);
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String field = error.getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
        });

        ApiResponse<Map<String, String>> response = new ApiResponse<>(
                ERROR_CODE.INVALID_KEY.getCode(),
                ERROR_CODE.INVALID_KEY.getMessage(),
                errors
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleValidationExceptions(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        });
        ApiResponse<?> response = new ApiResponse<>(
                ERROR_CODE.INVALID_KEY.getCode(),  ERROR_CODE.INVALID_KEY.getMessage(), errors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AppValidationException.class)
    public ResponseEntity<?> handleAppValidationException(AppValidationException ex) {
        log.error("Exception: ", ex);
        ApiResponse<?> response = new ApiResponse<>(
                ERROR_CODE.INVALID_KEY.getCode(),  ERROR_CODE.INVALID_KEY.getMessage(), ex.getFieldErrors()
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<?>> handlingException(Exception e) {
        log.error("Exception: ", e);
        ERROR_CODE errorCode = ERROR_CODE.UNKNOWN_EXCEPTION;
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return ResponseEntity.badRequest().body(apiResponse);
    }

    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get("min"));

        return message.replace("{min}", minValue);
    }

}
