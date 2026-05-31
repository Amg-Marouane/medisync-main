package com.medisync.audit;

import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {
    private final AuditLogRepository repository;

    public AuditController(AuditLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    List<AuditLog> list(@RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "50") int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size)).getContent();
    }
}
