# Architecture Notes

## Backend

The backend follows a feature-based package structure:

```txt
category/
product/
order/
common/
```

Each feature owns its controller, service, repository, entities and DTOs where applicable.

The order creation flow is transactional. When an order is created, the backend validates the request, loads the requested products, verifies stock availability, calculates totals, persists the order and order items, and decreases product stock.

## Frontend

The frontend uses Angular standalone components and signals.

The catalog feature is split into focused UI components:

```txt
product-catalog/
product-card/
cart-drawer/
checkout/
order-confirmation/
add-to-cart-confirmation/
```

The cart is stored in CartStore and persisted in LocalStorage. The checkout communicates with the backend through OrderApi.

## Testing Strategy

The backend uses two levels of testing:

* Unit tests for business logic in OrderService.
* Integration tests for the HTTP order creation flow through OrderControllerIntegrationTest.

The integration test uses MockMvc and verifies that the API persists the order and updates stock correctly.
