package com.pushpendra.opspilot.controller;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
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
    public ResponseEntity<List<IncidentResponse>> findAll() {
        return ResponseEntity.ok(incidentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> findById(@PathVariable UUID id) {
        return incidentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
