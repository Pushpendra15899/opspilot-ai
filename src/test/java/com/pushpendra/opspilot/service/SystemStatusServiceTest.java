package com.pushpendra.opspilot.service;

import com.pushpendra.opspilot.dto.SystemStatusResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SystemStatusServiceTest {

    @Test
    void statusReflectsConfiguredEnvironmentRatherThanAHardcodedValue() {
        SystemStatusService service = new SystemStatusService("prod");

        SystemStatusResponse status = service.getStatus();

        assertThat(status.application()).isEqualTo("OpsPilot AI");
        assertThat(status.status()).isEqualTo("UP");
        assertThat(status.environment()).isEqualTo("prod");
        assertThat(status.javaVersion()).isEqualTo(System.getProperty("java.version"));
    }
}