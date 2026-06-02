package com.medisync.document;

import com.medisync.document.dto.MedicalDocumentDto;
import com.medisync.user.User;
import com.medisync.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/dicom"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".pdf", ".jpg", ".jpeg", ".png", ".dcm"
    );

    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024; // 20 MB

    private final MedicalDocumentRepository repository;
    private final UserRepository users;
    private final Path storageRoot;

    public DocumentStorageService(MedicalDocumentRepository repository,
                                  UserRepository users,
                                  @Value("${app.document.storage-dir:uploads/documents}") String storageDir) {
        this.repository = repository;
        this.users = users;
        this.storageRoot = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageRoot);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage : " + storageDir, e);
        }
    }

    public MedicalDocumentDto upload(MultipartFile file, String description, String userEmail) {
        // ── Validations ───────────────────────────────────────────────────
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Le fichier dépasse la taille maximale de 20 Mo.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "inconnu";

        String extension = extractExtension(originalName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Format non accepté. Formats autorisés : PDF, JPG, PNG, DICOM (.dcm).");
        }

        // Determine document type from extension
        String documentType = switch (extension) {
            case ".pdf" -> "PDF";
            case ".jpg", ".jpeg" -> "JPG";
            case ".png" -> "PNG";
            case ".dcm" -> "DICOM";
            default -> "AUTRE";
        };

        // ── Store the file ────────────────────────────────────────────────
        String storedName = UUID.randomUUID() + extension;
        Path targetPath = storageRoot.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier.", e);
        }

        // ── Persist metadata ──────────────────────────────────────────────
        User patient = users.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        MedicalDocument doc = new MedicalDocument();
        doc.setPatient(patient);
        doc.setOriginalName(originalName);
        doc.setStoredName(storedName);
        doc.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        doc.setFileSize(file.getSize());
        doc.setDocumentType(documentType);
        doc.setDescription(description);

        return MedicalDocumentDto.from(repository.save(doc));
    }

    public List<MedicalDocumentDto> listByPatient(String email) {
        return repository.findByPatientEmailOrderByUploadedAtDesc(email)
                .stream()
                .map(MedicalDocumentDto::from)
                .toList();
    }

    public byte[] downloadFile(Long documentId, String userEmail) {
        MedicalDocument doc = repository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable."));

        if (!doc.getPatient().getEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalStateException("Non autorisé à accéder à ce document.");
        }

        Path filePath = storageRoot.resolve(doc.getStoredName());
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier.", e);
        }
    }

    public MedicalDocument getDocumentEntity(Long documentId) {
        return repository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable."));
    }

    public void deleteDocument(Long documentId, String userEmail) {
        MedicalDocument doc = repository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable."));

        if (!doc.getPatient().getEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalStateException("Non autorisé à supprimer ce document.");
        }

        Path filePath = storageRoot.resolve(doc.getStoredName());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // log but don't fail
        }
        repository.delete(doc);
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : "";
    }
}
