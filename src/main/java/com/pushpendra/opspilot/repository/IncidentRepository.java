package com.pushpendra.opspilot.repository;

import com.pushpendra.opspilot.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {
}
