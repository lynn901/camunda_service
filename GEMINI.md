# Camunda 7 Centralized Workflow Service (Workflow Hub)

This project is a centralized workflow engine built on **Camunda 7.20** and **Spring Boot 3.1.x**, designed to act as a "Workflow Hub" that manages process states and routing while delegating business logic to external microservices.

## Project Overview

- **Core Engine**: Camunda 7.20 (BPMN 2.0 compliant).
- **Backend Stack**: Spring Boot 3.1.5, Java 17, PostgreSQL, Maven.
- **Frontend Console**: React 19 + Vite + TypeScript (Modern, high-performance monitoring dashboard).
- **Architecture Patterns**: 
    - **Mode 1: HTTP Callback (Webhook)**: Engine proactively calls business APIs (implemented via `HttpCallbackDelegate`).
    - **Mode 2: External Task**: Business services pull tasks from the engine (Standard Camunda pattern, highly recommended for microservices).

## Building and Running

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker & Docker Compose

### Development Commands
- **Build the project**: `mvn clean package -DskipTests`
- **Run locally (Spring Boot)**: `mvn spring-boot:run`
- **Run full stack (Docker)**: 
    1. `cp .env.example .env` (Configure DB and Admin credentials)
    2. `docker-compose up -d --build`
- **Frontend Development**: 
    1. `cd frontend`
    2. `npm install`
    3. `npm run dev`

### Endpoints
- **API Base**: `http://localhost:8080/api/workflow` (Custom simplified API)
- **Engine Rest**: `http://localhost:8080/engine-rest` (Native Camunda REST API)
- **Camunda Cockpit**: `http://localhost:8080/camunda/app/cockpit` (Default: `admin/admin`)
- **Frontend Console**: `http://localhost:5173` (Custom React dashboard)

## Development Conventions

### Backend (Java/Spring Boot)
- **Code Style**: Standard Spring Boot conventions. Use **Lombok** for DTOs and logging (`@Slf4j`).
- **REST APIs**: `WorkflowController` provides a simplified interface for starting processes, completing tasks, and managing variables.
- **Engine Interaction**: Always use `WorkflowService` as the abstraction layer for `RuntimeService`, `TaskService`, etc.
- **Security**: Basic Auth is enabled via `CamundaSecurityConfig`. Credentials are authenticated against Camunda's `IdentityService` (`ACT_ID_USER`).
- **BPMN Deployment**: Place `.bpmn` files in `src/main/resources/processes/` for automatic deployment on startup.

### Frontend (React/Vite)
- **Styling**: Prefer **Vanilla CSS** with a modern design system inspired by Sanity (Dark theme, precise typography).
- **BPMN Integration**: Uses `bpmn-js` for process visualization and real-time monitoring.
- **Components**: Modular, functional React components with TypeScript.

### Best Practices
- **Idempotency**: All business endpoints called by the engine (Webhooks) or processing External Tasks must be idempotent.
- **Asynchronicity**: Use `Asynchronous Before/After` in BPMN configurations to ensure state persistence and reliable retries.
- **Environment Management**: Keep environment-specific configurations in `.env` and `application.yml` profiles.

## Key Files
- `pom.xml`: Project dependencies and build configuration.
- `src/main/java/.../WorkflowController.java`: Main entry point for business system integration.
- `src/main/java/.../delegate/HttpCallbackDelegate.java`: Standard implementation for the Webhook pattern.
- `design.md`: Comprehensive design document for the visual theme and UX principles.
- `docker-compose.yml`: Orchestration for the database, backend, and frontend.
