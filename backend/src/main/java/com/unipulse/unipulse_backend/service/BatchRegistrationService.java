package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.student.BatchRegistrationResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface BatchRegistrationService {
    BatchRegistrationResponseDto processBatchRegistration(InputStream inputStream);
    BatchRegistrationResponseDto processBatchRegistrationFile(MultipartFile file);
}
