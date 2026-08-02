package com.pushpendra.opspilot.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI opspilotOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("OpsPilot AI API")
                        .description("Incident management REST API for OpsPilot AI")
                        .version("v1"));
    }
}