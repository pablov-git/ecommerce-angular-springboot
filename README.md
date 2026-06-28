# ecommerce-angular-springboot

Full-stack e-commerce portfolio project built with Angular, Spring Boot, PostgreSQL and Redis.

## Architecture

- Frontend: Angular + TypeScript + NgRx SignalStore
- Backend: Java 21 + Spring Boot + Maven
- Database: PostgreSQL
- Cache: Redis
- Backend quality: MapStruct, Lombok, Bean Validation, SLF4J, JWT
- Testing: JUnit, Mockito, Spring Boot integration tests, k6
- Local infrastructure: Docker Compose

## Project structure

frontend/   Angular application
backend/    Spring Boot API
docs/       Architecture notes and screenshots

## Strategy

The frontend will be deployable as a public demo using mock data.

The backend will be real, documented and runnable locally with Docker Compose using PostgreSQL and Redis.

