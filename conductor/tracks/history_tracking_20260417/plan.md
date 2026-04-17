# Implementation Plan: Process Instance History Tracking

## Phase 1: Backend API Enhancement
Expose historical data via REST endpoints.

- [~] Task: Create `HistoricProcessInstanceDto` and Map Service Logic
    - [ ] Write tests for DTO mapping in `WorkflowService`.
    - [ ] Implement `HistoricProcessInstanceDto`.
    - [ ] Update `WorkflowService` to include history query logic.
    - [ ] Verify tests pass and coverage >80%.
- [~] Task: Implement History REST Endpoints in `WorkflowController`
    - [ ] Write integration tests for history endpoints.
    - [ ] Implement `GET /api/workflow/history/instances` and activity details.
    - [ ] Verify tests pass and endpoints are secured.
- [~] Task: Conductor - User Manual Verification 'Phase 1: Backend API Enhancement' (Protocol in workflow.md) (Protocol in workflow.md)

## Phase 2: Frontend Implementation
Build the history dashboard and visualization.

- [~] Task: Integrate History APIs into `camundaService.ts`
    - [ ] Write tests for history service methods.
    - [ ] Implement API wrapper methods in `camundaService.ts`.
    - [ ] Verify tests pass.
- [~] Task: Build History Page and Instance List
    - [ ] Write tests for `History.tsx` component.
    - [ ] Implement the UI for listing historical instances.
    - [ ] Verify layout and mobile responsiveness.
- [~] Task: Implement Path Visualization with `bpmn-js`
    - [ ] Write tests for diagram highlighting logic.
    - [ ] Integrate `bpmn-js` and implement executed path highlighting.
    - [ ] Verify visual accuracy against actual history data.
- [~] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation' (Protocol in workflow.md) (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions d36e84a