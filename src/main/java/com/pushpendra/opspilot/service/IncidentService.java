package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.dto.IncidentStatsResponse;
import com.pushpendra.opspilot.dto.IncidentTrendPoint;
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
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private static final int TREND_DAYS = 14;

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

    public IncidentStatsResponse getStats() {
        long total = incidentRepository.count();
        long open = incidentRepository.countByStatus(IncidentStatus.OPEN);
        long inProgress = incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS);
        long resolved = incidentRepository.countByStatus(IncidentStatus.RESOLVED);
        long closed = incidentRepository.countByStatus(IncidentStatus.CLOSED);
        long critical = incidentRepository.countBySeverityInAndStatusNot(
                EnumSet.of(Severity.P1, Severity.P2), IncidentStatus.CLOSED);

        return new IncidentStatsResponse(total, open, inProgress, resolved, closed, critical, buildTrend());
    }

    private List<IncidentTrendPoint> buildTrend() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate startDate = today.minusDays(TREND_DAYS - 1);
        Instant since = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();

        Map<LocalDate, Long> countsByDay = incidentRepository.countCreatedPerDaySince(since).stream()
                .collect(Collectors.toMap(
                        IncidentRepository.DailyIncidentCount::getDay,
                        IncidentRepository.DailyIncidentCount::getTotal));

        List<IncidentTrendPoint> trend = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            trend.add(new IncidentTrendPoint(date, countsByDay.getOrDefault(date, 0L)));
        }
        return trend;
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