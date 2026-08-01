package com.pushpendra.opspilot.dto;

import com.pushpendra.opspilot.model.IncidentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateIncidentStatusRequest(
        @NotNull IncidentStatus status
) {}
