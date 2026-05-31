package com.medisync.medical.dto;

import com.medisync.medical.MedicalRecord;
import java.time.Instant;

public record MedicalRecordDto(
        Long id,
        String patientName,
        String doctorName,
        String report,
        String prescription,
        Instant createdAt
) {
    public static MedicalRecordDto from(MedicalRecord record) {
        return new MedicalRecordDto(
                record.getId(),
                record.getPatient().getFullName(),
                record.getDoctor().getFullName(),
                record.getReport(),
                record.getPrescription(),
                record.getCreatedAt()
        );
    }
}
