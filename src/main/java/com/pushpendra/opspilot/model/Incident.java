package com.pushpendra.opspilot.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    protected Incident() {}

    public Incident(String title, String service, Severity severity, IncidentStatus status, Instant createdAt) {
        this.title = title;
        this.service = service;
        this.severity = severity;
        this.status = status;
        this.createdAt = createdAt;
    }

    public void updateStatus(IncidentStatus newStatus) {
        this.status = newStatus;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getService() { return service; }
    public Severity getSeverity() { return severity; }
    public IncidentStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
