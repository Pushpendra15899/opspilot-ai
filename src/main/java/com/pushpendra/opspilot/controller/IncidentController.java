package com.pushpendra.opspilot.controller;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.dto.UpdateIncidentStatusRequest;
import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.model.Severity;
import com.pushpendra.opspilot.service.IncidentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incidents", description = "Create, retrieve, filter, and transition incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody CreateIncidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<IncidentResponse>> findAll(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) String service,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(incidentService.findAll(status, severity, service, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(incidentService.findById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIncidentStatusRequest request) {
        return ResponseEntity.ok(incidentService.updateStatus(id, request));
    }
}