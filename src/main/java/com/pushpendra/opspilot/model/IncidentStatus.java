package com.pushpendra.opspilot.model;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum IncidentStatus {
    OPEN, IN_PROGRESS, RESOLVED, CLOSED;

    private static final Map<IncidentStatus, Set<IncidentStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(IncidentStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(OPEN, EnumSet.of(IN_PROGRESS));
        ALLOWED_TRANSITIONS.put(IN_PROGRESS, EnumSet.of(RESOLVED, OPEN));
        ALLOWED_TRANSITIONS.put(RESOLVED, EnumSet.of(CLOSED, IN_PROGRESS));
        ALLOWED_TRANSITIONS.put(CLOSED, EnumSet.noneOf(IncidentStatus.class));
    }

    public boolean canTransitionTo(IncidentStatus target) {
        return ALLOWED_TRANSITIONS.get(this).contains(target);
    }
}
