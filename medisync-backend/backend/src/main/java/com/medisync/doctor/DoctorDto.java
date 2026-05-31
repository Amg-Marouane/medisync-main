package com.medisync.doctor;

import java.math.BigDecimal;

public record DoctorDto(
        Long id,
        String fullName,
        String email,
        String specialty,
        String location,
        String spokenLanguages,
        BigDecimal consultationFee
) {
    public static DoctorDto from(DoctorProfile doctor) {
        return new DoctorDto(
                doctor.getId(),
                doctor.getUser().getFullName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialty(),
                doctor.getLocation(),
                doctor.getSpokenLanguages(),
                doctor.getConsultationFee()
        );
    }
}
