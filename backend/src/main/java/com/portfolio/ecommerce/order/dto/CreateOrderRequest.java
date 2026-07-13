package com.portfolio.ecommerce.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
    @NotBlank
    @Size(max = 160)
    String customerName,

    @NotBlank
    @Email
    @Size(max = 180)
    String customerEmail,

    @NotBlank
    @Size(max = 500)
    String shippingAddress,

    @NotEmpty
    List<@Valid CreateOrderItemRequest> items
) {
}