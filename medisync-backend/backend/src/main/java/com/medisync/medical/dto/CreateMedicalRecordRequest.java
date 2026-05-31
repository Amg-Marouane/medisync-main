package com.medisync.medical.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMedicalRecordRequest(@NotNull Long patientId, @NotBlank String report, String prescription) {
}
