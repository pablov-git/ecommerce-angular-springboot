package com.portfolio.ecommerce.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, UUID> {

    boolean existsByOrderNumber(String orderNumber);
}