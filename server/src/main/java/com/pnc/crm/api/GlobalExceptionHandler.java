package com.pnc.crm.api;

import com.pnc.crm.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.validation.FieldError;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        List<ErrorResponse.FieldViolation> violations = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(fe -> new ErrorResponse.FieldViolation(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());
        ErrorResponse resp = new ErrorResponse();
        resp.setStatus(HttpStatus.BAD_REQUEST.value());
        resp.setError(HttpStatus.BAD_REQUEST.getReasonPhrase());
        resp.setMessage("Validation failed");
        String corr = request.getHeader("X-Correlation-Id");
        if (corr != null) resp.setCorrelationId(corr);
        resp.setViolations(violations);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(IllegalArgumentException ex, WebRequest request) {
        ErrorResponse resp = new ErrorResponse();
        resp.setStatus(HttpStatus.NOT_FOUND.value());
        resp.setError(HttpStatus.NOT_FOUND.getReasonPhrase());
        resp.setMessage(ex.getMessage());
        String corr = request.getHeader("X-Correlation-Id");
        if (corr != null) resp.setCorrelationId(corr);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleConflict(IllegalStateException ex, WebRequest request) {
        ErrorResponse resp = new ErrorResponse();
        resp.setStatus(HttpStatus.CONFLICT.value());
        resp.setError(HttpStatus.CONFLICT.getReasonPhrase());
        resp.setMessage(ex.getMessage());
        String corr = request.getHeader("X-Correlation-Id");
        if (corr != null) resp.setCorrelationId(corr);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(resp);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(AccessDeniedException ex, WebRequest request) {
        ErrorResponse resp = new ErrorResponse();
        resp.setStatus(HttpStatus.FORBIDDEN.value());
        resp.setError(HttpStatus.FORBIDDEN.getReasonPhrase());
        resp.setMessage(ex.getMessage());
        String corr = request.getHeader("X-Correlation-Id");
        if (corr != null) resp.setCorrelationId(corr);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleSafe500(Exception ex, WebRequest request) {
        ErrorResponse resp = new ErrorResponse();
        resp.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        resp.setError(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        resp.setMessage("Internal server error");
        String corr = request.getHeader("X-Correlation-Id");
        if (corr != null) resp.setCorrelationId(corr);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
    }
}