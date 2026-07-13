package com.portfolio.ecommerce.order;

import com.portfolio.ecommerce.common.exception.ResourceNotFoundException;
import com.portfolio.ecommerce.order.dto.CreateOrderItemRequest;
import com.portfolio.ecommerce.order.dto.CreateOrderRequest;
import com.portfolio.ecommerce.order.dto.OrderItemResponse;
import com.portfolio.ecommerce.order.dto.OrderResponse;
import com.portfolio.ecommerce.product.Product;
import com.portfolio.ecommerce.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        CustomerOrder order = CustomerOrder.builder()
            .orderNumber(createOrderNumber())
            .customerName(request.customerName().trim())
            .customerEmail(request.customerEmail().trim())
            .shippingAddress(request.shippingAddress().trim())
            .status(OrderStatus.CREATED)
            .totalAmount(BigDecimal.ZERO)
            .createdAt(Instant.now())
            .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Product not found with id: " + itemRequest.productId()
                ));

            if (itemRequest.quantity() > product.getStock()) {
                throw new IllegalArgumentException(
                    "Not enough stock for product: " + product.getName()
                );
            }

            BigDecimal lineTotal = product.getPrice()
                .multiply(BigDecimal.valueOf(itemRequest.quantity()));

            OrderItem orderItem = OrderItem.builder()
                .productId(product.getId())
                .productSku(product.getSku())
                .productName(product.getName())
                .unitPrice(product.getPrice())
                .quantity(itemRequest.quantity())
                .lineTotal(lineTotal)
                .build();

            order.addItem(orderItem);

            product.setStock(product.getStock() - itemRequest.quantity());
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setTotalAmount(totalAmount);

        CustomerOrder savedOrder = customerOrderRepository.save(order);

        return toResponse(savedOrder);
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> items = order.getItems().stream()
            .map(item -> new OrderItemResponse(
                item.getProductId(),
                item.getProductSku(),
                item.getProductName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal()
            ))
            .toList();

        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getCustomerName(),
            order.getCustomerEmail(),
            order.getShippingAddress(),
            order.getStatus().name(),
            order.getTotalAmount(),
            order.getCreatedAt(),
            items
        );
    }

    private String createOrderNumber() {
        String orderNumber;

        do {
            orderNumber = "ORD-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
        } while (customerOrderRepository.existsByOrderNumber(orderNumber));

        return orderNumber;
    }
}