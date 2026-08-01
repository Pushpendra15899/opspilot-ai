package com.pushpendra.opspilot.dto;

public record SystemStatusResponse(
        String application,
        String status,
        String environment,
        String javaVersion
) {}
