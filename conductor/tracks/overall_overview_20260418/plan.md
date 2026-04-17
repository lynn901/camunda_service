# Implementation Plan: Overall Overview (整体概览) Redesign

## Phase 1: Backend API Enhancements [checkpoint: 454ac23]
- [x] Task: Create `MetricsDto` to hold Process Stats, Task Metrics, and System Health. 88e0998
- [x] Task: Implement `WorkflowService.getOverallMetrics()` to aggregate data from Camunda Java API (HistoryService, ManagementService) and System Actuator. 8c2e24a
    - [ ] Write unit tests for data aggregation.
    - [ ] Implement aggregation logic.
- [x] Task: Add `GET /api/workflow/metrics` endpoint in `WorkflowController`. 3ad1818
    - [ ] Write integration test for the new endpoint.
    - [ ] Implement endpoint.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend API Enhancements' (Protocol in workflow.md) 454ac23

## Phase 2: Frontend Data Layer & Routing [checkpoint: 771867e]
- [x] Task: Update Sidebar/Header navigation links from "Global Dashboard" to "Overall Overview" (整体概览). 3cc17fe
- [x] Task: Create `camundaService.getMetrics()` method to fetch data from the new backend endpoint, supporting date range parameters. f5c5667
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend Data Layer & Routing' (Protocol in workflow.md) 771867e

## Phase 3: Frontend UI Components (Widget Grid)
- [x] Task: Design and implement the flexible Widget Grid container component. a5fdaa2
- [x] Task: Create individual Metric Card components (Process Stats, Task Metrics, System Health) displaying the fetched data. 41c0c5f
    - [x] Add Drill-down Links to relevant cards. 41c0c5f
- [ ] Task: Implement Date Filtering controls and Auto-Refresh toggle/interval selector on the Overview page.
- [ ] Task: Integrate components into the main `Dashboard.tsx` (Overall Overview) page.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend UI Components (Widget Grid)' (Protocol in workflow.md)