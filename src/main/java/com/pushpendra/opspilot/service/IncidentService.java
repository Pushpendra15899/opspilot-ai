package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.dto.UpdateIncidentStatusRequest;
import com.pushpendra.opspilot.exception.IncidentNotFoundException;
import com.pushpendra.opspilot.exception.InvalidStatusTransitionException;
import com.pushpendra.opspilot.model.Incident;
import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.model.Severity;
import com.pushpendra.opspilot.repository.IncidentRepository;
import com.pushpendra.opspilot.repository.IncidentSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

    public Page<IncidentResponse> findAll(IncidentStatus status, Severity severity, String service, Pageable pageable) {
        return incidentRepository
                .findAll(IncidentSpecifications.filterBy(status, severity, service), pageable)
                .map(this::toResponse);
    }

    public IncidentResponse findById(UUID id) {
        return incidentRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IncidentNotFoundException(id));
    }

    public IncidentResponse updateStatus(UUID id, UpdateIncidentStatusRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException(id));

        IncidentStatus current = incident.getStatus();
        IncidentStatus target = request.status();
        if (!current.canTransitionTo(target)) {
            throw new InvalidStatusTransitionException(current, target);
        }

        incident.updateStatus(target);
        return toResponse(incidentRepository.save(incident));
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