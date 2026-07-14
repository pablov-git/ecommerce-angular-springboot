package com.portfolio.ecommerce.seed;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.portfolio.ecommerce.category.Category;
import com.portfolio.ecommerce.category.CategoryRepository;
import com.portfolio.ecommerce.product.Product;
import com.portfolio.ecommerce.product.ProductRepository;
import com.portfolio.ecommerce.seed.dto.SeedProduct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            ClassPathResource resource = new ClassPathResource("seed/products.json");

            try (InputStream inputStream = resource.getInputStream()) {
                List<SeedProduct> seedProducts = objectMapper.readValue(
                    inputStream,
                    new TypeReference<>() {
                    }
                );

                int insertedProducts = 0;
                int updatedProducts = 0;

                for (SeedProduct seedProduct : seedProducts) {
                    Category category = findOrCreateCategory(seedProduct.category());

                    Product product = productRepository.findBySku(seedProduct.sku())
                        .orElse(null);

                    if (product == null) {
                        productRepository.save(
                            Product.builder()
                                .sku(seedProduct.sku())
                                .name(seedProduct.name())
                                .description(seedProduct.description())
                                .price(seedProduct.price())
                                .stock(seedProduct.stock())
                                .imageUrl(seedProduct.imageUrl())
                                .category(category)
                                .build()
                        );

                        insertedProducts++;
                    } else {
                        product.setName(seedProduct.name());
                        product.setDescription(seedProduct.description());
                        product.setPrice(seedProduct.price());
                        product.setImageUrl(seedProduct.imageUrl());
                        product.setCategory(category);

                        updatedProducts++;
                    }
                }

                log.info(
                    "Product seed completed. {} products inserted, {} products updated",
                    insertedProducts,
                    updatedProducts
                );
            }
        } catch (Exception exception) {
            log.error("Product seed failed: {}", exception.getMessage(), exception);
        }
    }

    private Category findOrCreateCategory(String categoryName) {
        String slug = toSlug(categoryName);

        return categoryRepository.findBySlug(slug)
            .orElseGet(() -> categoryRepository.save(
                Category.builder()
                    .name(categoryName)
                    .slug(slug)
                    .build()
            ));
    }

    private String toSlug(String value) {
        return value
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
    }
}