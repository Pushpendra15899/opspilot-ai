package com.pushpendra.opspilot.dto;

import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.model.Severity;

import java.time.Instant;
import java.util.UUID;

public record IncidentResponse(
        UUID id,
        String title,
        String service,
        Severity severity,
        IncidentStatus status,
        Instant createdAt
) {}
