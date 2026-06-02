package com.medisync.document;

import com.medisync.document.dto.MedicalDocumentDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentStorageService storage;

    public DocumentController(DocumentStorageService storage) {
        this.storage = storage;
    }

    /**
     * Upload a medical document (PDF, JPG, PNG, DICOM). Max 20 MB.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PATIENT')")
    public MedicalDocumentDto upload(@RequestParam("file") MultipartFile file,
                                     @RequestParam(value = "description", required = false) String description,
                                     Principal principal) {
        return storage.upload(file, description, principal.getName());
    }

    /**
     * List all documents of the authenticated patient.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public List<MedicalDocumentDto> myDocuments(Principal principal) {
        return storage.listByPatient(principal.getName());
    }

    /**
     * Download a specific document by id.
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<byte[]> download(@PathVariable Long id, Principal principal) {
        MedicalDocument doc = storage.getDocumentEntity(id);
        if (!doc.getPatient().getEmail().equalsIgnoreCase(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        byte[] content = storage.downloadFile(id, principal.getName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(doc.getContentType()));
        headers.setContentDispositionFormData("attachment", doc.getOriginalName());

        return ResponseEntity.ok().headers(headers).body(content);
    }

    /**
     * Delete a document.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PATIENT')")
    public void delete(@PathVariable Long id, Principal principal) {
        storage.deleteDocument(id, principal.getName());
    }
}
