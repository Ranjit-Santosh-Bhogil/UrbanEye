package com.urbaneye.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private String error;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("details")
    private Map<String, Object> details;

    public static ErrorResponse of(int status, String message, String error) {
        return ErrorResponse.builder()
                .status(status)
                .message(message)
                .error(error)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(int status, String message, String error, Map<String, Object> details) {
        return ErrorResponse.builder()
                .status(status)
                .message(message)
                .error(error)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();
    }
}
