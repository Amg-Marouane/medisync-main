package com.medisync.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String performedBy;

    private String targetType;
    private String targetId;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public AuditLog() {}

    public AuditLog(String action, String performedBy, String targetType, String targetId, String details) {
        this.action = action;
        this.performedBy = performedBy;
        this.targetType = targetType;
        this.targetId = targetId;
        this.details = details;
    }

    public Long getId() { return id; }
    public String getAction() { return action; }
    public String getPerformedBy() { return performedBy; }
    public String getTargetType() { return targetType; }
    public String getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
}
