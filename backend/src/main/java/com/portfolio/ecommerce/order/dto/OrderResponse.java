package com.portfolio.ecommerce.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    UUID id,
    String orderNumber,
    String customerName,
    String customerEmail,
    String shippingAddress,
    String status,
    BigDecimal totalAmount,
    Instant createdAt,
    List<OrderItemResponse> items
) {
}