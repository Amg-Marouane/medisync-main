package com.medisync.document.dto;

import com.medisync.document.MedicalDocument;

import java.time.Instant;

public record MedicalDocumentDto(
        Long id,
        String originalName,
        String contentType,
        Long fileSize,
        String documentType,
        String description,
        Instant uploadedAt
) {
    public static MedicalDocumentDto from(MedicalDocument doc) {
        return new MedicalDocumentDto(
                doc.getId(),
                doc.getOriginalName(),
                doc.getContentType(),
                doc.getFileSize(),
                doc.getDocumentType(),
                doc.getDescription(),
                doc.getUploadedAt()
        );
    }
}
