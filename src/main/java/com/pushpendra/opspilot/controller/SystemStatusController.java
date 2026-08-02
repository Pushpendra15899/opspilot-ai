package com.pushpendra.opspilot.controller;

import com.pushpendra.opspilot.dto.SystemStatusResponse;
import com.pushpendra.opspilot.service.SystemStatusService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
@Tag(name = "System", description = "Application status information")
public class SystemStatusController {

    private final SystemStatusService systemStatusService;

    public SystemStatusController(SystemStatusService systemStatusService) {
        this.systemStatusService = systemStatusService;
    }

    @GetMapping("/status")
    public SystemStatusResponse getStatus() {
        return systemStatusService.getStatus();
    }
}
