package com.pushpendra.opspilot.dto;

import java.time.LocalDate;

public record IncidentTrendPoint(LocalDate date, long count) {}