package com.medisync.audit;

import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(String action, String performedBy, String targetType, String targetId, String details) {
        repository.save(new AuditLog(action, performedBy, targetType, targetId, details));
    }
}
