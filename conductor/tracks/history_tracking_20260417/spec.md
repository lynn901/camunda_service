# Track Specification: Process Instance History Tracking

## Overview
This track aims to provide users with the ability to track and visualize the execution history of process instances within the Workflow Hub dashboard. Currently, only active instances are easily accessible; this feature will leverage Camunda's History Service to expose and display completed and running instance data.

## Objectives
- Expose Camunda History Service APIs via the backend `WorkflowController`.
- Implement a dedicated "History" view in the React frontend.
- Visualize the execution path of historical process instances using `bpmn-js`.

## Requirements
- **Backend:**
    - New DTO `HistoricProcessInstanceDto` to carry historical data.
    - `WorkflowService` methods to query `HistoricProcessInstance`.
    - REST endpoints:
        - `GET /api/workflow/history/instances`: List historical instances with filtering.
        - `GET /api/workflow/history/instances/{id}/activities`: List activities for a specific instance.
- **Frontend:**
    - Update `camundaService.ts` with new API calls.
    - Create `History.tsx` page to list instances.
    - Enhance instance details view to show the BPMN diagram with highlighted historical paths.

## Tech Stack Impact
- No changes to the core tech stack. Leveraging existing Camunda 7 features.

## Acceptance Criteria
- Users can see a list of completed and active process instances in the History tab.
- Clicking an instance displays its metadata and the BPMN diagram.
- The BPMN diagram highlights which activities were executed.
- API endpoints are secured with Basic Auth.