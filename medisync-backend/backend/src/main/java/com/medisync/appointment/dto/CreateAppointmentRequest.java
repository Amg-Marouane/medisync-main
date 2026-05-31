package com.medisync.appointment.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record CreateAppointmentRequest(
        @NotNull Long doctorId,
        @Future @NotNull LocalDateTime startsAt,
        @Positive int durationMinutes,
        @NotBlank String reason,
        String patientEmail,
        String bookedForName
) {
}
