# E-commerce Angular + Spring Boot

Full-stack e-commerce application built as a portfolio project with Angular, Spring Boot, PostgreSQL and Docker.

The project implements a real product catalog, shopping cart, checkout flow and order persistence. The backend exposes a REST API, validates order requests, persists customer orders and order items in PostgreSQL, and updates product stock when an order is placed.

## Tech Stack

### Frontend

* Angular 21
* TypeScript
* Standalone components
* Angular signals
* Angular Router
* SCSS
* LocalStorage cart persistence

### Backend

* Java 21
* Spring Boot 4.1
* Spring Web MVC
* Spring Data JPA
* Hibernate
* PostgreSQL
* Bean Validation
* Lombok
* MapStruct
* Maven

### Infrastructure and tooling

* Docker Compose
* PostgreSQL 16
* Redis 7
* GitHub Actions
* JUnit
* Mockito
* Spring Boot integration tests
* MockMvc

## Features

### Product catalog

* Product listing loaded from the backend API.
* Category filtering.
* Product search.
* Product sorting by name and price.
* Product stock display.

### Cart

* Add products to cart.
* Increase and decrease item quantity.
* Remove items.
* Clear cart.
* Cart persisted in LocalStorage.
* Cart synchronized with current backend product stock.

### Checkout

* Checkout route with form validation.
* Order summary before placing the order.
* Order creation through backend API.
* Error state when the order cannot be placed.

### Backend order flow

When the frontend sends `POST /api/orders`, the backend:

1. Validates the request body.
2. Checks that every product exists.
3. Checks that requested quantities do not exceed available stock.
4. Calculates line totals and order total.
5. Creates a `customer_orders` record.
6. Creates related `order_items`.
7. Decreases product stock.
8. Returns the created order response.

## Project Structure

```txt
ecommerce-angular-springboot/
  backend/
    src/main/java/com/portfolio/ecommerce/
      category/
      common/
      order/
      product/
      seed/
    src/test/java/com/portfolio/ecommerce/
      order/
    src/main/resources/
      application.yaml
      seed/products.json
    pom.xml

  frontend/
    src/app/
      features/catalog/
        add-to-cart-confirmation/
        cart-drawer/
        checkout/
        data/
        models/
        order-confirmation/
        product-card/
        product-catalog/
      app.config.ts
      app.routes.ts
      app.html
      app.ts
    package.json

  compose.yml
  README.md
```

## Backend Architecture

The backend is organized by feature package:

```txt
category/
product/
order/
common/
```

This avoids placing everything into generic controller, service and repository folders and keeps each domain area easier to maintain.

The order module contains:

```txt
order/
  CustomerOrder.java
  OrderItem.java
  OrderStatus.java
  CustomerOrderRepository.java
  OrderService.java
  OrderController.java
  dto/
    CreateOrderRequest.java
    CreateOrderItemRequest.java
    OrderResponse.java
    OrderItemResponse.java
```

## Frontend Architecture

The frontend uses standalone Angular components and signals.

Main catalog components:

```txt
product-catalog/
product-card/
cart-drawer/
checkout/
order-confirmation/
add-to-cart-confirmation/
```

State is handled with simple injectable stores:

```txt
CartStore
OrderStore
```

The cart is persisted in LocalStorage.

## API Endpoints

### Products

```http
GET /api/products
```

Returns all products.

```http
GET /api/products/{id}
```

Returns a product by ID.

### Categories

```http
GET /api/categories
```

Returns all categories.

### Orders

```http
POST /api/orders
```

Creates a customer order.

Example request:

```json
{
  "customerName": "Pablo",
  "customerEmail": "pablo@example.com",
  "shippingAddress": "Calle Test 123",
  "items": [
    {
      "productId": "PRODUCT_UUID",
      "quantity": 2
    }
  ]
}
```

Example response:

```json
{
  "id": "ORDER_UUID",
  "orderNumber": "ORD-AB12CD34",
  "customerName": "Pablo",
  "customerEmail": "pablo@example.com",
  "shippingAddress": "Calle Test 123",
  "status": "CREATED",
  "totalAmount": 179.98,
  "createdAt": "2026-07-13T21:30:00Z",
  "items": [
    {
      "productId": "PRODUCT_UUID",
      "productSku": "KEYBOARD-001",
      "productName": "Mechanical Keyboard",
      "unitPrice": 89.99,
      "quantity": 2,
      "lineTotal": 179.98
    }
  ]
}
```

## Local Setup

### Requirements

* Java 21
* Node.js compatible with Angular 21
* Docker Desktop
* Maven Wrapper
* npm

Angular 21 supports Node.js ^20.19.0, ^22.12.0 or ^24.0.0, according to the official Angular version compatibility table.

### 1. Start PostgreSQL and Redis

From the project root:

```powershell
docker compose up -d
```

Services:

```txt
PostgreSQL: localhost:5433
Redis: localhost:6379
```

Database credentials:

```txt
Database: ecommerce_db
User: ecommerce_user
Password: ecommerce_pass
```

### 2. Start backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend URL:

```txt
http://localhost:8081
```

### 3. Start frontend

```powershell
cd frontend
npm install
npm start
```

Frontend URL:

```txt
http://localhost:4200
```

## Useful Commands

### Backend tests

```powershell
cd backend
.\mvnw.cmd test
```

### Frontend build

```powershell
cd frontend
npm run build
```

### Check PostgreSQL tables

```powershell
docker exec -it ecommerce-postgres psql -U ecommerce_user -d ecommerce_db
```

Inside psql:

```sql
\dt

SELECT order_number, customer_email, total_amount, status, created_at
FROM customer_orders;

SELECT product_sku, product_name, quantity, unit_price, line_total
FROM order_items;

SELECT sku, name, stock
FROM products
ORDER BY name;
```

Exit:

```sql
\q
```

## Testing

The backend includes both unit and integration tests.

### Unit tests

OrderServiceTest validates the order business logic in isolation with Mockito:

* Successful order creation.
* Total calculation.
* Order item creation.
* Product stock decrement.
* Product not found.
* Insufficient stock.

### Integration tests

OrderControllerIntegrationTest validates the complete HTTP flow with Spring Boot and MockMvc:

* POST /api/orders returns 201 Created.
* Order is persisted.
* Order items are created.
* Product stock is decremented.
* Invalid product returns 404.
* Invalid request body returns 400.

## Current Status

Implemented:

* Product catalog API.
* Category API.
* Product seeding from JSON.
* Angular catalog UI.
* Cart drawer.
* LocalStorage cart persistence.
* Checkout route.
* Backend order creation.
* PostgreSQL persistence for orders.
* Stock update after order creation.
* Unit tests for order service.
* Integration tests for order endpoint.
* Docker Compose local environment.

Planned improvements:

* Authentication with JWT.
* Admin product management.
* More advanced state management with NgRx SignalStore.
* Testcontainers for database integration tests.
* Public frontend demo with mock mode.
* API documentation with OpenAPI.
