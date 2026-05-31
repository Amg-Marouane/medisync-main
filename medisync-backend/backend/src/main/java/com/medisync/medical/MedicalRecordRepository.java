package com.medisync.medical;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientEmailOrderByCreatedAtDesc(String email);
}
