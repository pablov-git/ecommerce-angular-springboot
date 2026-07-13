package com.portfolio.ecommerce.order;

import com.portfolio.ecommerce.common.exception.ResourceNotFoundException;
import com.portfolio.ecommerce.order.dto.CreateOrderItemRequest;
import com.portfolio.ecommerce.order.dto.CreateOrderRequest;
import com.portfolio.ecommerce.order.dto.OrderResponse;
import com.portfolio.ecommerce.product.Product;
import com.portfolio.ecommerce.product.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private CustomerOrderRepository customerOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void create_shouldCreateOrderAndDecreaseProductStock() {
        UUID productId = UUID.randomUUID();

        Product product = Product.builder()
            .id(productId)
            .sku("KEYBOARD-001")
            .name("Mechanical Keyboard")
            .description("Compact mechanical keyboard.")
            .price(new BigDecimal("89.99"))
            .stock(10)
            .imageUrl("/assets/products/keyboard.jpg")
            .build();

        CreateOrderRequest request = new CreateOrderRequest(
            "Pablo",
            "pablo@example.com",
            "Calle Test 123",
            List.of(
                new CreateOrderItemRequest(productId, 2)
            )
        );

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(customerOrderRepository.existsByOrderNumber(anyString())).thenReturn(false);
        when(customerOrderRepository.save(any(CustomerOrder.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.create(request);

        assertThat(response.orderNumber()).startsWith("ORD-");
        assertThat(response.customerName()).isEqualTo("Pablo");
        assertThat(response.customerEmail()).isEqualTo("pablo@example.com");
        assertThat(response.shippingAddress()).isEqualTo("Calle Test 123");
        assertThat(response.status()).isEqualTo(OrderStatus.CREATED.name());
        assertThat(response.totalAmount()).isEqualByComparingTo("179.98");
        assertThat(response.items()).hasSize(1);

        assertThat(response.items().getFirst().productId()).isEqualTo(productId);
        assertThat(response.items().getFirst().productSku()).isEqualTo("KEYBOARD-001");
        assertThat(response.items().getFirst().productName()).isEqualTo("Mechanical Keyboard");
        assertThat(response.items().getFirst().unitPrice()).isEqualByComparingTo("89.99");
        assertThat(response.items().getFirst().quantity()).isEqualTo(2);
        assertThat(response.items().getFirst().lineTotal()).isEqualByComparingTo("179.98");

        assertThat(product.getStock()).isEqualTo(8);

        ArgumentCaptor<CustomerOrder> orderCaptor = ArgumentCaptor.forClass(CustomerOrder.class);
        verify(customerOrderRepository).save(orderCaptor.capture());

        CustomerOrder savedOrder = orderCaptor.getValue();

        assertThat(savedOrder.getOrderNumber()).startsWith("ORD-");
        assertThat(savedOrder.getTotalAmount()).isEqualByComparingTo("179.98");
        assertThat(savedOrder.getItems()).hasSize(1);
        assertThat(savedOrder.getItems().getFirst().getOrder()).isSameAs(savedOrder);
    }

    @Test
    void create_shouldFailWhenProductDoesNotExist() {
        UUID productId = UUID.randomUUID();

        CreateOrderRequest request = new CreateOrderRequest(
            "Pablo",
            "pablo@example.com",
            "Calle Test 123",
            List.of(
                new CreateOrderItemRequest(productId, 1)
            )
        );

        when(customerOrderRepository.existsByOrderNumber(anyString())).thenReturn(false);
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.create(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Product not found with id:");

        verify(customerOrderRepository, never()).save(any(CustomerOrder.class));
    }

    @Test
    void create_shouldFailWhenThereIsNotEnoughStock() {
        UUID productId = UUID.randomUUID();

        Product product = Product.builder()
            .id(productId)
            .sku("MOUSE-001")
            .name("Wireless Mouse")
            .description("Ergonomic wireless mouse.")
            .price(new BigDecimal("39.99"))
            .stock(1)
            .imageUrl("/assets/products/mouse.jpg")
            .build();

        CreateOrderRequest request = new CreateOrderRequest(
            "Pablo",
            "pablo@example.com",
            "Calle Test 123",
            List.of(
                new CreateOrderItemRequest(productId, 2)
            )
        );

        when(customerOrderRepository.existsByOrderNumber(anyString())).thenReturn(false);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.create(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Not enough stock for product: Wireless Mouse");

        assertThat(product.getStock()).isEqualTo(1);

        verify(customerOrderRepository, never()).save(any(CustomerOrder.class));
    }
}