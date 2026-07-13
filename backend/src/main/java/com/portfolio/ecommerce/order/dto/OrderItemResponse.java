package com.portfolio.ecommerce.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
    UUID productId,
    String productSku,
    String productName,
    BigDecimal unitPrice,
    Integer quantity,
    BigDecimal lineTotal
) {
}