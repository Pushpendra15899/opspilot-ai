package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.dto.IncidentStatsResponse;
import com.pushpendra.opspilot.dto.UpdateIncidentStatusRequest;
import com.pushpendra.opspilot.exception.IncidentNotFoundException;
import com.pushpendra.opspilot.exception.InvalidStatusTransitionException;
import com.pushpendra.opspilot.model.Incident;
import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.model.Severity;
import com.pushpendra.opspilot.repository.IncidentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private IncidentService incidentService;

    @Test
    void createPersistsIncidentAsOpen() {
        CreateIncidentRequest request = new CreateIncidentRequest("DB down", "billing-service", Severity.P1);
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentResponse response = incidentService.create(request);

        assertThat(response.status()).isEqualTo(IncidentStatus.OPEN);
        assertThat(response.title()).isEqualTo("DB down");
        assertThat(response.service()).isEqualTo("billing-service");
        assertThat(response.severity()).isEqualTo(Severity.P1);
    }

    @Test
    void findByIdReturnsIncidentWhenPresent() {
        UUID id = UUID.randomUUID();
        Incident incident = new Incident("DB down", "billing-service", Severity.P1, IncidentStatus.OPEN, Instant.now());
        when(incidentRepository.findById(id)).thenReturn(Optional.of(incident));

        IncidentResponse response = incidentService.findById(id);

        assertThat(response.title()).isEqualTo("DB down");
    }

    @Test
    void findByIdThrowsWhenMissing() {
        UUID id = UUID.randomUUID();
        when(incidentRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidentService.findById(id))
                .isInstanceOf(IncidentNotFoundException.class);
    }

    @Test
    void updateStatusAllowsOpenToInProgress() {
        UUID id = UUID.randomUUID();
        Incident incident = new Incident("DB down", "billing-service", Severity.P1, IncidentStatus.OPEN, Instant.now());
        when(incidentRepository.findById(id)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentResponse response = incidentService.updateStatus(id, new UpdateIncidentStatusRequest(IncidentStatus.IN_PROGRESS));

        assertThat(response.status()).isEqualTo(IncidentStatus.IN_PROGRESS);
    }

    @Test
    void updateStatusRejectsIllegalTransition() {
        UUID id = UUID.randomUUID();
        Incident incident = new Incident("DB down", "billing-service", Severity.P1, IncidentStatus.OPEN, Instant.now());
        when(incidentRepository.findById(id)).thenReturn(Optional.of(incident));

        assertThatThrownBy(() -> incidentService.updateStatus(id, new UpdateIncidentStatusRequest(IncidentStatus.CLOSED)))
                .isInstanceOf(InvalidStatusTransitionException.class);
    }

    @Test
    void updateStatusThrowsWhenIncidentMissing() {
        UUID id = UUID.randomUUID();
        when(incidentRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidentService.updateStatus(id, new UpdateIncidentStatusRequest(IncidentStatus.IN_PROGRESS)))
                .isInstanceOf(IncidentNotFoundException.class);
    }

    @Test
    void getStatsAggregatesCountsAndFillsEmptyTrend() {
        when(incidentRepository.count()).thenReturn(10L);
        when(incidentRepository.countByStatus(IncidentStatus.OPEN)).thenReturn(3L);
        when(incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS)).thenReturn(2L);
        when(incidentRepository.countByStatus(IncidentStatus.RESOLVED)).thenReturn(4L);
        when(incidentRepository.countByStatus(IncidentStatus.CLOSED)).thenReturn(1L);
        when(incidentRepository.countBySeverityInAndStatusNot(any(), eq(IncidentStatus.CLOSED))).thenReturn(5L);
        when(incidentRepository.countCreatedPerDaySince(any())).thenReturn(List.of());

        IncidentStatsResponse stats = incidentService.getStats();

        assertThat(stats.total()).isEqualTo(10L);
        assertThat(stats.open()).isEqualTo(3L);
        assertThat(stats.inProgress()).isEqualTo(2L);
        assertThat(stats.resolved()).isEqualTo(4L);
        assertThat(stats.closed()).isEqualTo(1L);
        assertThat(stats.critical()).isEqualTo(5L);
        assertThat(stats.trend()).hasSize(14);
        assertThat(stats.trend()).allSatisfy(point -> assertThat(point.count()).isZero());
    }

    @Test
    void getStatsMapsRepositoryTrendRowsOntoMatchingDates() {
        when(incidentRepository.count()).thenReturn(1L);
        when(incidentRepository.countByStatus(any())).thenReturn(0L);
        when(incidentRepository.countBySeverityInAndStatusNot(any(), any())).thenReturn(0L);

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        IncidentRepository.DailyIncidentCount row = new IncidentRepository.DailyIncidentCount() {
            @Override
            public LocalDate getDay() { return today; }

            @Override
            public long getTotal() { return 7L; }
        };
        when(incidentRepository.countCreatedPerDaySince(any())).thenReturn(List.of(row));

        IncidentStatsResponse stats = incidentService.getStats();

        assertThat(stats.trend()).last().satisfies(point -> {
            assertThat(point.date()).isEqualTo(today);
            assertThat(point.count()).isEqualTo(7L);
        });
    }
}