package com.portfolio.ecommerce.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Pixeltronics API",
        version = "1.0.0",
        description = """
            REST API for the Pixeltronics e-commerce application.

            Provides product and category queries and transactional
            customer order creation with stock validation and persistence.
            """,
        contact = @Contact(
            name = "Pablo"
        ),
        license = @License(
            name = "MIT"
        )
    ),
    servers = {
        @Server(
            url = "http://localhost:8081",
            description = "Local development server"
        )
    }
)
public class OpenApiConfig {
}