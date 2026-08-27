package com.unipulse.unipulse_backend.exception;

public class CreditCapExceededException extends RuntimeException {
    public CreditCapExceededException(String message) {
        super(message);
    }
}
