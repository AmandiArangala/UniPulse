package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.student.BatchRegistrationResponseDto;
import com.unipulse.unipulse_backend.service.BatchRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/students/batch-register")
@RequiredArgsConstructor
public class BatchRegistrationController {

    private final BatchRegistrationService batchRegistrationService;

    @PostMapping(value = "/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BatchRegistrationResponseDto>> batchRegisterStudents(
            @RequestParam("file") MultipartFile file
    ) {
        BatchRegistrationResponseDto response = batchRegistrationService.processBatchRegistrationFile(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Batch student registration processed successfully"));
    }
}
