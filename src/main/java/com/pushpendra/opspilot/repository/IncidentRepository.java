package com.pushpendra.opspilot.repository;

import com.pushpendra.opspilot.model.Incident;
import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.model.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID>, JpaSpecificationExecutor<Incident> {

    long countByStatus(IncidentStatus status);

    long countBySeverityInAndStatusNot(Collection<Severity> severities, IncidentStatus excludedStatus);

    @Query(value = """
            SELECT CAST(created_at AS date) AS day, COUNT(*) AS total
            FROM incidents
            WHERE created_at >= :since
            GROUP BY day
            ORDER BY day
            """, nativeQuery = true)
    List<DailyIncidentCount> countCreatedPerDaySince(@Param("since") Instant since);

    interface DailyIncidentCount {
        LocalDate getDay();
        long getTotal();
    }
}