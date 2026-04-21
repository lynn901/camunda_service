# Track Specification: Refactor Frontend and Integrate with Backend Services

## Goal
Refactor the existing frontend prototype (based on `base.js` mock data) into a production-ready React/TypeScript application and integrate it with the Spring Boot/Camunda backend services.

## Scope
- **Frontend Refactoring:**
  - Replace mock data in `base.js` with real API calls using `React-Query`.
  - Implement full TypeScript typing for all components and data structures.
  - Integrate `bpmn-js` for dynamic process visualization.
  - Implement all core modules: Dashboard, Intervention Center, History, BPMN Library, Scheduled Tasks, and Worker Monitoring.
- **Backend Integration:**
  - Connect the frontend to the `WorkflowController` in the Spring Boot application.
  - Ensure all CRUD operations (Deploy, Start Instance, Suspend, Retry, Delete) are correctly mapped to the Camunda 7 REST API.
  - Implement/verify Metrics endpoints for the Dashboard overview.
- **Visual Design:**
  - Ensure the final UI matches the `OpsFlowEngine` design document (Indigo theme, modern UX).

## Architecture
- **Frontend:** React (Vite) + TypeScript + Tailwind CSS + Lucide-React.
- **Backend:** Spring Boot 3.1.5 + Camunda BPM 7.20.0 + PostgreSQL.
- **Communication:** REST APIs via Axios/React-Query.

## Key Modules to Implement
1. **Dashboard:** High-level metrics visualization (Active, Success, Failure).
2. **Intervention Center:** List of active/failed instances with diagnostic tools and process diagrams.
3. **BPMN Library:** Model deployment and manual trigger interface.
4. **Execution History:** Historical view of completed/terminated processes.
5. **Worker Monitoring:** Real-time health status of external task workers.

## Acceptance Criteria
- All mock data from `base.js` is replaced by real data from the backend.
- Users can deploy a BPMN file and start instances from the UI.
- Operators can retry failed instances or modify variables through the Intervention Center.
- The UI follows the defined design guidelines (Indigo primary color, modern layout).
- Automated tests cover at least 80% of new code.
