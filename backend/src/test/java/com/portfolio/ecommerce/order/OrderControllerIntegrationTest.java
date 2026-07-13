package com.portfolio.ecommerce.order;

import com.portfolio.ecommerce.category.Category;
import com.portfolio.ecommerce.category.CategoryRepository;
import com.portfolio.ecommerce.product.Product;
import com.portfolio.ecommerce.product.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Test
    void create_shouldPersistOrderAndDecreaseStock() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString();
        String customerEmail = "integration-" + uniqueSuffix + "@example.com";

        Category category = categoryRepository.save(
            Category.builder()
                .name("Integration Test Category " + uniqueSuffix)
                .slug("integration-test-category-" + uniqueSuffix)
                .build()
        );

        Product product = productRepository.save(
            Product.builder()
                .sku("IT-PRODUCT-" + uniqueSuffix)
                .name("Integration Test Product")
                .description("Product created for integration testing.")
                .price(new BigDecimal("49.99"))
                .stock(5)
                .imageUrl("/assets/products/integration-test.jpg")
                .category(category)
                .build()
        );

        String requestBody = """
            {
              "customerName": "Pablo",
              "customerEmail": "%s",
              "shippingAddress": "Calle Test 123",
              "items": [
                {
                  "productId": "%s",
                  "quantity": 2
                }
              ]
            }
            """.formatted(customerEmail, product.getId());

        mockMvc.perform(
                post("/api/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody)
            )
            .andExpect(status().isCreated())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.orderNumber", startsWith("ORD-")))
            .andExpect(jsonPath("$.customerName").value("Pablo"))
            .andExpect(jsonPath("$.customerEmail").value(customerEmail))
            .andExpect(jsonPath("$.shippingAddress").value("Calle Test 123"))
            .andExpect(jsonPath("$.status").value("CREATED"))
            .andExpect(jsonPath("$.totalAmount").value(99.98))
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].productId").value(product.getId().toString()))
            .andExpect(jsonPath("$.items[0].productSku").value(product.getSku()))
            .andExpect(jsonPath("$.items[0].productName").value("Integration Test Product"))
            .andExpect(jsonPath("$.items[0].quantity").value(2))
            .andExpect(jsonPath("$.items[0].lineTotal").value(99.98));

        CustomerOrder savedOrder = customerOrderRepository.findAll()
            .stream()
            .filter(order -> order.getCustomerEmail().equals(customerEmail))
            .findFirst()
            .orElseThrow();

        assertThat(savedOrder.getOrderNumber()).startsWith("ORD-");
        assertThat(savedOrder.getCustomerEmail()).isEqualTo(customerEmail);
        assertThat(savedOrder.getTotalAmount()).isEqualByComparingTo("99.98");
        assertThat(savedOrder.getItems()).hasSize(1);

        Product updatedProduct = productRepository.findById(product.getId())
            .orElseThrow();

        assertThat(updatedProduct.getStock()).isEqualTo(3);
    }

    @Test
    void create_shouldReturnNotFoundWhenProductDoesNotExist() throws Exception {
        String requestBody = """
            {
              "customerName": "Pablo",
              "customerEmail": "pablo@example.com",
              "shippingAddress": "Calle Test 123",
              "items": [
                {
                  "productId": "%s",
                  "quantity": 1
                }
              ]
            }
            """.formatted(UUID.randomUUID());

        mockMvc.perform(
                post("/api/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody)
            )
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void create_shouldReturnBadRequestWhenBodyIsInvalid() throws Exception {
        String requestBody = """
            {
              "customerName": "",
              "customerEmail": "invalid-email",
              "shippingAddress": "",
              "items": []
            }
            """;

        mockMvc.perform(
                post("/api/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody)
            )
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Bad Request"));
    }
}