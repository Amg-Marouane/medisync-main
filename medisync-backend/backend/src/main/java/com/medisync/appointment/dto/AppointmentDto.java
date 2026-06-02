package com.medisync.appointment.dto;

import com.medisync.appointment.Appointment;
import com.medisync.appointment.AppointmentStatus;
import java.time.LocalDateTime;

public record AppointmentDto(
        Long id,
        Long doctorId,
        String patientEmail,
        String patientName,
        String doctorName,
        String specialty,
        LocalDateTime startsAt,
        int durationMinutes,
        String reason,
        String bookedForName,
        String relation,
        AppointmentStatus status
) {
    public static AppointmentDto from(Appointment appointment) {
        return new AppointmentDto(
                appointment.getId(),
                appointment.getDoctor().getId(),
                appointment.getPatient().getEmail(),
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getUser().getFullName(),
                appointment.getDoctor().getSpecialty(),
                appointment.getStartsAt(),
                appointment.getDurationMinutes(),
                appointment.getReason(),
                appointment.getBookedForName(),
                appointment.getRelation(),
                appointment.getStatus()
        );
    }
}
