package com.pushpendra.opspilot.exception;

import com.pushpendra.opspilot.model.IncidentStatus;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(IncidentStatus from, IncidentStatus to) {
        super("Cannot transition incident from " + from + " to " + to);
    }
}