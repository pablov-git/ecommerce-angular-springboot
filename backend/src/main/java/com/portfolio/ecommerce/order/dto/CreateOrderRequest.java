package com.portfolio.ecommerce.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Data required to create a customer order")
public record CreateOrderRequest(
    @NotBlank
    @Size(max = 160)
    @Schema(
        description = "Customer full name",
        example = "Portfolio User",
        maxLength = 160
    )
    String customerName,

    @NotBlank
    @Email
    @Size(max = 180)
    @Schema(
        description = "Customer email address",
        example = "portfolio@example.com",
        maxLength = 180
    )
    String customerEmail,

    @NotBlank
    @Size(max = 500)
    @Schema(
        description = "Order shipping address",
        example = "123 Example Street, Madrid",
        maxLength = 500
    )
    String shippingAddress,

    @NotEmpty
    @Schema(
        description = "Products and quantities included in the order"
    )
    List<@Valid CreateOrderItemRequest> items
) {
}