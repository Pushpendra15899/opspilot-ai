package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.SystemStatusResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SystemStatusService {

    private final String environment;

    public SystemStatusService(@Value("${app.environment:dev}") String environment) {
        this.environment = environment;
    }

    public SystemStatusResponse getStatus() {
        return new SystemStatusResponse(
                "OpsPilot AI",
                "UP",
                environment,
                System.getProperty("java.version")
        );
    }
}
