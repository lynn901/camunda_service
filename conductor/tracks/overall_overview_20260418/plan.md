# Implementation Plan: Overall Overview (整体概览) Redesign

## Phase 1: Backend API Enhancements
- [ ] Task: Create `MetricsDto` to hold Process Stats, Task Metrics, and System Health.
- [ ] Task: Implement `WorkflowService.getOverallMetrics()` to aggregate data from Camunda Java API (HistoryService, ManagementService) and System Actuator.
    - [ ] Write unit tests for data aggregation.
    - [ ] Implement aggregation logic.
- [ ] Task: Add `GET /api/workflow/metrics` endpoint in `WorkflowController`.
    - [ ] Write integration test for the new endpoint.
    - [ ] Implement endpoint.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend API Enhancements' (Protocol in workflow.md)

## Phase 2: Frontend Data Layer & Routing
- [ ] Task: Update Sidebar/Header navigation links from "Global Dashboard" to "Overall Overview" (整体概览).
- [ ] Task: Create `camundaService.getMetrics()` method to fetch data from the new backend endpoint, supporting date range parameters.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Data Layer & Routing' (Protocol in workflow.md)

## Phase 3: Frontend UI Components (Widget Grid)
- [ ] Task: Design and implement the flexible Widget Grid container component.
- [ ] Task: Create individual Metric Card components (Process Stats, Task Metrics, System Health) displaying the fetched data.
    - [ ] Add Drill-down Links to relevant cards.
- [ ] Task: Implement Date Filtering controls and Auto-Refresh toggle/interval selector on the Overview page.
- [ ] Task: Integrate components into the main `Dashboard.tsx` (Overall Overview) page.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend UI Components (Widget Grid)' (Protocol in workflow.md)