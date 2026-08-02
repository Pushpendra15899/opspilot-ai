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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
}