package com.unipulse.unipulse_backend.util;

import com.unipulse.unipulse_backend.dto.student.BatchStudentCsvRowDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class CsvParserUtil {

    public static List<BatchStudentCsvRowDto> parseStudentRegistrationCsv(InputStream inputStream) {
        List<BatchStudentCsvRowDto> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                // Skip empty lines or BOM
                if (lineNumber == 1 && line.startsWith("\uFEFF")) {
                    line = line.substring(1);
                }
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] tokens = line.split(",", -1);

                if (isHeader) {
                    isHeader = false;
                    // Validate basic header expectation if needed
                    continue;
                }

                if (tokens.length < 7) {
                    throw new BadRequestException("CSV parsing error at line " + lineNumber + ": insufficient columns. Expected 7 columns.");
                }

                try {
                    BatchStudentCsvRowDto row = BatchStudentCsvRowDto.builder()
                            .username(tokens[0].trim())
                            .email(tokens[1].trim())
                            .firstName(tokens[2].trim())
                            .lastName(tokens[3].trim())
                            .studentNumber(tokens[4].trim())
                            .programCode(tokens[5].trim())
                            .enrollmentYear(Integer.parseInt(tokens[6].trim()))
                            .build();

                    rows.add(row);
                } catch (NumberFormatException e) {
                    throw new BadRequestException("CSV parsing error at line " + lineNumber + ": invalid enrollment year number format.");
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV stream: " + e.getMessage());
        }

        if (rows.isEmpty()) {
            throw new BadRequestException("CSV file contains no student data rows");
        }

        return rows;
    }

    public static List<com.unipulse.unipulse_backend.dto.assessment.BatchMarkCsvRowDto> parseMarksBatchCsv(InputStream inputStream) {
        List<com.unipulse.unipulse_backend.dto.assessment.BatchMarkCsvRowDto> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (lineNumber == 1 && line.startsWith("\uFEFF")) {
                    line = line.substring(1);
                }
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] tokens = line.split(",", -1);

                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                if (tokens.length < 2) {
                    throw new BadRequestException("CSV parsing error at line " + lineNumber + ": insufficient columns. Minimum required: studentNumber, scoreObtained.");
                }

                String studentNumber = tokens[0].trim();
                String scoreStr = tokens[1].trim();

                if (studentNumber.isEmpty()) {
                    throw new BadRequestException("CSV parsing error at line " + lineNumber + ": studentNumber cannot be empty.");
                }

                java.math.BigDecimal score;
                try {
                    score = new java.math.BigDecimal(scoreStr);
                } catch (NumberFormatException e) {
                    throw new BadRequestException("CSV parsing error at line " + lineNumber + ": invalid score number format '" + scoreStr + "'.");
                }

                Boolean isLate = false;
                if (tokens.length >= 3 && !tokens[2].trim().isEmpty()) {
                    String lateStr = tokens[2].trim().toLowerCase();
                    isLate = "true".equals(lateStr) || "1".equals(lateStr) || "yes".equals(lateStr);
                }

                String feedback = null;
                if (tokens.length >= 4 && !tokens[3].trim().isEmpty()) {
                    feedback = tokens[3].trim();
                }

                com.unipulse.unipulse_backend.dto.assessment.BatchMarkCsvRowDto row = com.unipulse.unipulse_backend.dto.assessment.BatchMarkCsvRowDto.builder()
                        .studentNumber(studentNumber)
                        .scoreObtained(score)
                        .isLate(isLate)
                        .feedback(feedback)
                        .build();

                rows.add(row);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV stream: " + e.getMessage());
        }

        if (rows.isEmpty()) {
            throw new BadRequestException("CSV file contains no assessment mark rows");
        }

        return rows;
    }
}

