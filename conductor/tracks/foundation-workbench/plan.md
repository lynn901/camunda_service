# Plan: Phase 1 - Foundation & Workbench

## Objective
Establish the enterprise-grade admin foundation using Ant Design Pro and implement the Workbench (Module 1) with "My To-Do" and "My Done" functionality.

## 1. Setup & Migration
- [x] Backup current frontend to `frontend-legacy/`
- [x] Initialize new Ant Design Pro project in `frontend/`
- [x] Configure `proxy` in the new setup (pointing to Camunda engine at `localhost:8080`)
- [x] Port `authFetch` from `frontend-legacy/src/utils.ts` and integrate it into the global request interceptor

## 2. Navigation & Layout
- [x] Define side menu structure in `config/routes.ts`:
  - [x] Dashboard (Workbench)
    - [x] Pending Tasks
    - [x] My Done (Finished Executions)
    - [x] My Applications
  - [x] Flow Model & Form Center (Placeholder)
  - [x] Engine Management (Placeholder)
  - [x] Monitoring Center (Placeholder)
  - [x] Organization & Permissions (Placeholder)
  - [x] Analytics (Placeholder)

## 3. Module 1: Workbench - My To-Do
- [x] Create `Workbench/Pending` page using `ProTable`
- [x] Implement Unified Task fetching (User Task + External Task) using the ported `authFetch`
- [x] Implement "Approve/Reject" basic actions in the table actions

## 4. Module 1: Workbench - Task Detail Side Panel
- [x] On clicking a task, open a side drawer (`Drawer` component)
- [x] Display task details (Variables, Basic Info)
- [x] Integrate `bpmn-js` viewer to highlight the current activity in the diagram
- [x] Implement multi-action panel (Agree, Reject) within the drawer

## 5. Module 1: Workbench - My Done
- [x] Create `Workbench/Done` page using `ProTable`
- [x] Fetch historical process instances (`/history/process-instance`)
- [x] Display completion time and status

## 6. Module 1: Workbench - Active Task Triggers (Redesign Scope)
- [x] **Launchpad (流程发起中心)**: Design the UI/UX for process catalog, quick search, and favorites.
- [x] **Form Integration**: Architect data linkage and default value mapping for start forms (Implemented basic start modal).
- [ ] **Drafts**: Design local or server-side storage strategy for draft form submissions.
- [x] **Process Intervention**: Map business actions to Camunda Message/Signal correlation APIs in the task detail panel.
- [x] **Ad-hoc Tasks**: Design Camunda standalone task API integration and UI for creating and assigning free-form tasks.

## Verification
- [ ] Verify task counts match Camunda engine data.
- [ ] Verify BPMN diagram correctly highlights the active task node.
- [ ] Verify "Approve" action correctly advances the `order-process` workflow.
