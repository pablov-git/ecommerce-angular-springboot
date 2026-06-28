package com.portfolio.ecommerce.seed.dto;

import java.math.BigDecimal;

public record SeedProduct(
    String sku,
    String name,
    String description,
    BigDecimal price,
    Integer stock,
    String category,
    String imageUrl
) {
}