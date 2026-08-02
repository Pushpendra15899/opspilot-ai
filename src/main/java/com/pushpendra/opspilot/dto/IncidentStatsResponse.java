package com.pushpendra.opspilot.dto;

import java.util.List;

public record IncidentStatsResponse(
        long total,
        long open,
        long inProgress,
        long resolved,
        long closed,
        long critical,
        List<IncidentTrendPoint> trend
) {}