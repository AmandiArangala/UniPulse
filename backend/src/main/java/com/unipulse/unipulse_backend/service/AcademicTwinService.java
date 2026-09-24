package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.student.AcademicTwinDto;

import java.math.BigDecimal;
import java.util.UUID;

public interface AcademicTwinService {

    AcademicTwinDto getAcademicTwinForStudent(UUID studentId);

    AcademicTwinDto calculateCustomAcademicTwin(
            UUID studentId,
            BigDecimal customAttn,
            BigDecimal customSubm,
            BigDecimal customEngage,
            BigDecimal customPerf
    );
}
