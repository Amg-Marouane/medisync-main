package com.medisync.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
    List<MedicalDocument> findByPatientEmailOrderByUploadedAtDesc(String email);
    List<MedicalDocument> findByPatientIdOrderByUploadedAtDesc(Long patientId);
}
