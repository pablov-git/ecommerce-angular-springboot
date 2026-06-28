package com.portfolio.ecommerce.product;

import com.portfolio.ecommerce.product.dto.ProductResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.slug", target = "categorySlug")
    ProductResponse toResponse(Product product);

    List<ProductResponse> toResponseList(List<Product> products);
}