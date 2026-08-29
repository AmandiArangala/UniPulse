package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchMarkCsvRowDto {

    private String studentNumber;

    private BigDecimal scoreObtained;

    private Boolean isLate;

    private String feedback;
}
