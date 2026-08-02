package com.pushpendra.opspilot.repository;

import com.pushpendra.opspilot.model.Incident;
import com.pushpendra.opspilot.model.IncidentStatus;
import com.pushpendra.opspilot.model.Severity;
import org.springframework.data.jpa.domain.Specification;

public final class IncidentSpecifications {

    private IncidentSpecifications() {}

    public static Specification<Incident> hasStatus(IncidentStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Incident> hasSeverity(Severity severity) {
        return (root, query, cb) -> severity == null ? null : cb.equal(root.get("severity"), severity);
    }

    public static Specification<Incident> hasService(String service) {
        return (root, query, cb) -> service == null ? null : cb.equal(root.get("service"), service);
    }

    public static Specification<Incident> filterBy(IncidentStatus status, Severity severity, String service) {
        return Specification.allOf(hasStatus(status), hasSeverity(severity), hasService(service));
    }
}