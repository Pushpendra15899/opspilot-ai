package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.model.IncidentStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IncidentService {

    private final Map<UUID, IncidentResponse> store = new ConcurrentHashMap<>();

    public IncidentResponse create(CreateIncidentRequest request) {
        UUID id = UUID.randomUUID();
        IncidentResponse incident = new IncidentResponse(
                id,
                request.title(),
                request.service(),
                request.severity(),
                IncidentStatus.OPEN,
                Instant.now()
        );
        store.put(id, incident);
        return incident;
    }

    public List<IncidentResponse> findAll() {
        return List.copyOf(store.values());
    }

    public Optional<IncidentResponse> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }
}
