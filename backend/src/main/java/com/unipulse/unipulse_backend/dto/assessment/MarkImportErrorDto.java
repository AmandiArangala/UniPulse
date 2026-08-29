package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkImportErrorDto {

    private Integer rowNumber;

    private String studentNumber;

    private String errorMessage;
}
