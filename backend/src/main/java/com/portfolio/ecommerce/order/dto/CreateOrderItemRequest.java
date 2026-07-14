package com.portfolio.ecommerce.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(description = "Product and quantity requested in an order")
public record CreateOrderItemRequest(
    @NotNull
    @Schema(
        description = "UUID of an existing product",
        example = "550e8400-e29b-41d4-a716-446655440000"
    )
    UUID productId,

    @NotNull
    @Min(1)
    @Schema(
        description = "Requested product quantity",
        example = "2",
        minimum = "1"
    )
    Integer quantity
) {
}