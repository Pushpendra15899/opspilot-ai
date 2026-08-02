package com.pushpendra.opspilot.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "System", description = "Application status information")
public class HealthController {

@GetMapping("/api/health")
    public String health() {
    return "OpsPilot AI is running.";
}
}
