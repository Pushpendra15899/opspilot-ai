package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.SystemStatusResponse;
import org.springframework.stereotype.Service;

@Service
public class SystemStatusService {

    public SystemStatusResponse getStatus() {
        return new SystemStatusResponse(
                "OpsPilot AI",
                "UP",
                "local",
                System.getProperty("java.version")
        );
    }
}
