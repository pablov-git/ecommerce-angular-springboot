package com.portfolio.ecommerce.product.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    String sku,
    String name,
    String description,
    BigDecimal price,
    Integer stock,
    String imageUrl,
    UUID categoryId,
    String categoryName,
    String categorySlug
) {
}