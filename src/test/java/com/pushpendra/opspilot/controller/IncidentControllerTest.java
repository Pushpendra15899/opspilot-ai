package com.pushpendra.opspilot.controller;

import com.pushpendra.opspilot.dto.CreateIncidentRequest;
import com.pushpendra.opspilot.dto.IncidentResponse;
import com.pushpendra.opspilot.dto.IncidentStatsResponse;
import com.pushpendra.opspilot.dto.IncidentTrendPoint;
import com.pushpendra.opspilot.dto.UpdateIncidentStatusRequest;
import com.pushpendra.opspilot.exception.IncidentNotFoundException;
import com.pushpendra.opspilot.exception.InvalidStatusTransitionException;
import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.model.Severity;
import com.pushpendra.opspilot.service.IncidentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncidentController.class)
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IncidentService incidentService;

    private IncidentResponse sampleResponse(UUID id, IncidentStatus status) {
        return new IncidentResponse(id, "DB down", "billing-service", Severity.P1, status, Instant.now());
    }

    @Test
    void createReturns201() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidentService.create(any())).thenReturn(sampleResponse(id, IncidentStatus.OPEN));

        CreateIncidentRequest request = new CreateIncidentRequest("DB down", "billing-service", Severity.P1);

        mockMvc.perform(post("/api/incidents")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.title").value("DB down"));
    }

    @Test
    void createReturns400WhenTitleBlank() throws Exception {
        CreateIncidentRequest request = new CreateIncidentRequest("", "billing-service", Severity.P1);

        mockMvc.perform(post("/api/incidents")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    @Test
    void findByIdReturns200WhenPresent() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidentService.findById(id)).thenReturn(sampleResponse(id, IncidentStatus.OPEN));

        mockMvc.perform(get("/api/incidents/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void findByIdReturns404WhenMissing() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidentService.findById(id)).thenThrow(new IncidentNotFoundException(id));

        mockMvc.perform(get("/api/incidents/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void findAllReturnsPagedResults() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidentService.findAll(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(sampleResponse(id, IncidentStatus.OPEN)), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/incidents").param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(id.toString()))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void findAllReturns400ForInvalidStatusFilter() throws Exception {
        mockMvc.perform(get("/api/incidents").param("status", "NOT_A_STATUS"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateStatusReturns200OnValidTransition() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidentService.updateStatus(eq(id), any())).thenReturn(sampleResponse(id, IncidentStatus.IN_PROGRESS));

        mockMvc.perform(patch("/api/incidents/{id}/status", id)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(new UpdateIncidentStatusRequest(IncidentStatus.IN_PROGRESS))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void updateStatusReturns409OnIllegalTransition() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidentService.updateStatus(eq(id), any()))
                .thenThrow(new InvalidStatusTransitionException(IncidentStatus.OPEN, IncidentStatus.CLOSED));

        mockMvc.perform(patch("/api/incidents/{id}/status", id)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(new UpdateIncidentStatusRequest(IncidentStatus.CLOSED))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void updateStatusReturns404WhenIncidentMissing() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidentService.updateStatus(eq(id), any())).thenThrow(new IncidentNotFoundException(id));

        mockMvc.perform(patch("/api/incidents/{id}/status", id)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(new UpdateIncidentStatusRequest(IncidentStatus.IN_PROGRESS))))
                .andExpect(status().isNotFound());
    }

    @Test
    void statsReturnsAggregatedCounts() throws Exception {
        IncidentStatsResponse stats = new IncidentStatsResponse(
                10, 3, 2, 4, 1, 5,
                List.of(new IncidentTrendPoint(LocalDate.now(), 2)));
        when(incidentService.getStats()).thenReturn(stats);

        mockMvc.perform(get("/api/incidents/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(10))
                .andExpect(jsonPath("$.open").value(3))
                .andExpect(jsonPath("$.critical").value(5))
                .andExpect(jsonPath("$.trend").isArray())
                .andExpect(jsonPath("$.trend[0].count").value(2));
    }
}