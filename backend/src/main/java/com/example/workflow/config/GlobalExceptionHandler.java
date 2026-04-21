package com.example.workflow.config;

import org.camunda.bpm.engine.ProcessEngineException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MultipartException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ProcessEngineException.class)
    public ResponseEntity<Map<String, Object>> handleProcessEngineException(ProcessEngineException e) {
        log.error("Camunda Engine Error: ", e);
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Workflow Engine Error");
        body.put("message", e.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, Object>> handleIOException(IOException e) {
        log.error("IO Error: ", e);
        Map<String, Object> body = new HashMap<>();
        body.put("error", "File Processing Error");
        body.put("message", "Failed to process the uploaded file: " + e.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Map<String, Object>> handleMultipartException(MultipartException e) {
        log.error("Multipart Error: ", e);
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Upload Error");
        body.put("message", "File upload failed: " + e.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception e) {
        log.error("Unexpected Error: ", e);
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Internal Server Error");
        body.put("message", "An unexpected error occurred: " + e.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
