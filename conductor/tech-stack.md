# Technology Stack

## Backend
- **Core Platform:** Java 17, Spring Boot 3.1.5.
- **BPMN Engine:** Camunda BPM 7.20.0 (Spring Boot Starter REST and Webapp).
- **Persistence:** PostgreSQL (Primary), H2 (In-memory for local testing).
- **Monitoring:** Spring Boot Actuator.
- **Utilities:** Lombok (Used for boilerplate reduction).

## Frontend
- **Framework:** React with TypeScript.
- **Build Tool:** Vite.
- **Styling:** Tailwind CSS for layout and aesthetics.
- **Icons:** Lucide-React.
- **BPMN Rendering:** bpmn-js for high-fidelity process visualization.
- **State Management:** React-Query for robust asynchronous data fetching and caching.

## Build & CI/CD
- **Backend:** Maven 3.9+.
- **Frontend:** npm or Yarn (Standard Vite workflow).
- **Deployment:** Docker & Docker Compose (Containerized multi-service environment).
