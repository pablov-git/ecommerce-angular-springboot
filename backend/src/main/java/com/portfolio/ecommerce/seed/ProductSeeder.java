package com.portfolio.ecommerce.seed;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.portfolio.ecommerce.category.Category;
import com.portfolio.ecommerce.category.CategoryRepository;
import com.portfolio.ecommerce.product.Product;
import com.portfolio.ecommerce.product.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.portfolio.ecommerce.seed.dto.SeedProduct;

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
        if (productRepository.count() > 0) {
            log.info("Product seed skipped because products already exist");
            return;
        }

        try {
            ClassPathResource resource = new ClassPathResource("seed/products.json");

            try (InputStream inputStream = resource.getInputStream()) {
                List<SeedProduct> seedProducts = objectMapper.readValue(
                    inputStream,
                    new TypeReference<>() {
                    }
                );

                List<Product> products = seedProducts.stream()
                    .map(this::toProduct)
                    .toList();

                productRepository.saveAll(products);

                log.info("Product seed completed. {} products inserted", products.size());
            }
        } catch (Exception exception) {
            log.error("Product seed failed: {}", exception.getMessage(), exception);
        }
    }

    private Product toProduct(SeedProduct seedProduct) {
        Category category = categoryRepository.findByName(seedProduct.category())
            .orElseGet(() -> categoryRepository.save(
                Category.builder()
                    .name(seedProduct.category())
                    .slug(toSlug(seedProduct.category()))
                    .build()
            ));

        return Product.builder()
            .sku(seedProduct.sku())
            .name(seedProduct.name())
            .description(seedProduct.description())
            .price(seedProduct.price())
            .stock(seedProduct.stock())
            .imageUrl(seedProduct.imageUrl())
            .category(category)
            .build();
    }

    private String toSlug(String value) {
        return value
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
    }
}