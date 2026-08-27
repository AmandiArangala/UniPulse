package com.unipulse.unipulse_backend.exception;

public class PrerequisiteNotMetException extends RuntimeException {
    public PrerequisiteNotMetException(String message) {
        super(message);
    }
}
