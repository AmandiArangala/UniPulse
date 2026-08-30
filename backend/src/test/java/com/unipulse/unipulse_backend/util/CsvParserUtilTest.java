package com.unipulse.unipulse_backend.util;

import com.unipulse.unipulse_backend.dto.assessment.BatchMarkCsvRowDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CsvParserUtilTest {

    @Test
    @DisplayName("Should successfully parse valid marks CSV stream")
    void shouldParseValidMarksCsv() {
        String csvData = "studentNumber,scoreObtained,isLate,feedback\n" +
                "IT21001234, 85.50, false, Great performance\n" +
                "IT21005678, 62.00, true, Submitted 2 hours late\n";

        InputStream stream = new ByteArrayInputStream(csvData.getBytes(StandardCharsets.UTF_8));
        List<BatchMarkCsvRowDto> rows = CsvParserUtil.parseMarksBatchCsv(stream);

        assertEquals(2, rows.size());
        assertEquals("IT21001234", rows.get(0).getStudentNumber());
        assertEquals(new BigDecimal("85.50"), rows.get(0).getScoreObtained());
        assertFalse(rows.get(0).getIsLate());
        assertEquals("Great performance", rows.get(0).getFeedback());

        assertEquals("IT21005678", rows.get(1).getStudentNumber());
        assertEquals(new BigDecimal("62.00"), rows.get(1).getScoreObtained());
        assertTrue(rows.get(1).getIsLate());
        assertEquals("Submitted 2 hours late", rows.get(1).getFeedback());
    }

    @Test
    @DisplayName("Should throw BadRequestException when CSV contains invalid score number format")
    void shouldThrowOnInvalidScoreNumberFormat() {
        String csvData = "studentNumber,scoreObtained\n" +
                "IT21001234, INVALID_SCORE\n";

        InputStream stream = new ByteArrayInputStream(csvData.getBytes(StandardCharsets.UTF_8));
        assertThrows(BadRequestException.class, () -> CsvParserUtil.parseMarksBatchCsv(stream));
    }

    @Test
    @DisplayName("Should throw BadRequestException when CSV has no data rows")
    void shouldThrowOnEmptyCsvData() {
        String csvData = "studentNumber,scoreObtained\n";

        InputStream stream = new ByteArrayInputStream(csvData.getBytes(StandardCharsets.UTF_8));
        assertThrows(BadRequestException.class, () -> CsvParserUtil.parseMarksBatchCsv(stream));
    }
}
