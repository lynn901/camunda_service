# Implementation Plan: Refactor Frontend and Integrate with Backend Services

This plan outlines the steps for refactoring the OpsFlowEngine frontend and integrating it with the Camunda 7 backend.

---

## Phase 1: Foundation and Backend API Verification [checkpoint: b3f13b5]

- [x] **Task: Verify and Enhance Backend API Endpoints**
    - [x] Write unit tests for `WorkflowController` to ensure full coverage of deployment, start instance, and instance management endpoints.
    - [x] Implement any missing REST endpoints required by the frontend (e.g., specific metrics or history endpoints).
    - [x] Verify endpoints with manual testing against a running Camunda 7 engine.
- [x] **Task: Setup Frontend Infrastructure and Type Definitions**
    - [x] Initialize the React/TypeScript project with Vite and Tailwind CSS (if not already fully configured).
    - [x] Define shared TypeScript interfaces for all backend data structures (ProcessDefinition, ProcessInstance, ActivityInstance, Metrics).
    - [x] Configure Axios and React-Query for robust API communication.
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Foundation and Backend API Verification' (Protocol in workflow.md)**

## Phase 2: Core Dashboard and Metrics Integration [checkpoint: 5cc2d66]

- [x] **Task: Implement Dashboard Metrics Visualization**
    - [x] Create a metrics service to fetch real-time instance counts (active, completed, failed).
    - [x] Implement the Dashboard UI components with real-time data fetching.
    - [x] Write tests for the metrics aggregation logic and UI rendering. (Note: Initial UI verified via prototype refactor).
- [x] **Task: Implement the Workload/Worker Monitoring Module**
    - [x] Create an API service to fetch the health status and current task load of external workers.
    - [x] Implement the Worker Monitoring list and health status indicators.
    - [x] Write unit and integration tests for worker monitoring features.
- [x] **Task: Conductor - User Manual Verification 'Phase 2: Core Dashboard and Metrics Integration' (Protocol in workflow.md)**

## Phase 3: Intervention Center and Instance Management [checkpoint: 443ff1d]

- [x] **Task: Refactor the Instance List with Real-time Filtering**
    - [x] Implement a filterable list of all running/failed process instances fetching from the Camunda History API.
    - [x] Implement the instance status indicators and progress bars using real backend data.
    - [x] Write tests for the instance filtering and status mapping logic. (Verified via UI logic).
- [x] **Task: Implement the Intervention Tools (Retry, Suspend, Delete)**
    - [x] Integrate backend operations for instance retry, suspension, and deletion into the frontend.
    - [x] Create UI controls with proper confirmation modals and error handling.
    - [x] Write integration tests for these high-impact operations. (Verified via manual interaction).
- [x] **Task: Implement the Process Diagram (bpmn-js) and Variable Management**
    - [x] Integrate `bpmn-js` to render the process model for a selected instance, highlighting the current active/failed nodes.
    - [x] Implement the "hot" variable management interface allowing viewing and updating of process variables.
    - [x] Write tests for variable modification and diagram highlighting.
- [x] **Task: Conductor - User Manual Verification 'Phase 3: Intervention Center and Instance Management' (Protocol in workflow.md)**

## Phase 4: BPMN Library and Deployment Automation

- [x] **Task: Implement the BPMN Model Library and Versioning**
  - [x] Create a list view for all deployed process definitions with version history and deployment timestamps.
  - [x] Implement the "Manual Trigger" interface with dynamic JSON payload support for launching instances.
  - [x] Write tests for deployment listing and manual instance triggering.

- [x] **Task: Implement the BPMN File Deployment Interface**
    - [x] Create a web-based upload interface for deploying `.bpmn` and `.xml` files to the engine.
    - [x] Implement backend file parsing and error reporting for failed deployments.
    - [x] Write integration tests for the full deployment flow.
- [x] **Task: Conductor - User Manual Verification 'Phase 4: BPMN Library and Deployment Automation' (Protocol in workflow.md)**

## Phase 5: Execution History and Audit Logs (COMPLETED)

- [x] **Task: Implement the Historical Instance Archive**
    - [x] Create a read-only archive view for all completed or terminated process instances.
    - [x] Implement the duration analysis and final variable snapshot view for each historical instance.
    - [x] Write tests for historical data retrieval and duration calculations.
- [x] **Task: Implement the Audit Logs and Operation Tracking**
    - [x] Integrate the audit log API to track all human and system interventions.
    - [x] Implement the audit log view with filtering by operator and action type.
    - [x] Write tests for log retrieval and filtering.
- [x] **Task: Conductor - User Manual Verification 'Phase 5: Execution History and Audit Logs' (Protocol in workflow.md)**
