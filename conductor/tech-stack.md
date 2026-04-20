# Tech Stack

## Primary Technologies
- **Backend:** Java 17, Spring Boot 3.1.5
- **Engine:** Camunda 7.20.0 (BPMN 2.0 compliant)
- **Database:** PostgreSQL (using standard JDBC for engine state and application data)
- **Build Tool:** Maven 3.8+

## Frontend Stack
- **Library:** React (with TypeScript)
- **Framework:** Vite for high-performance development and bundling
- **Integration:** React-Query for asynchronous data management and `bpmn-js` for process visualization.

## Tooling & Observability
- **Engine Monitoring:** Camunda Cockpit for core engine administration.
- **Custom Dashboard:** Modern React console for process metrics and lifecycle management.
- **Dependency Management:** Lombok for boilerplate reduction in DTOs and logging.
- **Security:** Basic Auth with Camunda's `IdentityService`.

## Infrastructure
- **Deployment:** Docker & Docker Compose for multi-environment orchestration.
- **Environment Management:** `.env` and `application.yml` profiles for configuration.
