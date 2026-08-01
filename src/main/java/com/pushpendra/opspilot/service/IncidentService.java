package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.model.Incident;
import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public IncidentResponse create(CreateIncidentRequest request) {
        Incident incident = new Incident(
                request.title(),
                request.service(),
                request.severity(),
                IncidentStatus.OPEN,
                Instant.now()
        );
        return toResponse(incidentRepository.save(incident));
    }

    public List<IncidentResponse> findAll() {
        return incidentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<IncidentResponse> findById(UUID id) {
        return incidentRepository.findById(id).map(this::toResponse);
    }

    private IncidentResponse toResponse(Incident incident) {
        return new IncidentResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getService(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getCreatedAt()
        );
    }
}
