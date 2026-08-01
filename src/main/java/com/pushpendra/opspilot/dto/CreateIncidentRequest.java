package com.pushpendra.opspilot.dto;

import com.pushpendra.opspilot.model.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateIncidentRequest(
        @NotBlank String title,
        @NotBlank String service,
        @NotNull Severity severity
) {}
