# Plan: Phase 2 - Operations Monitoring (Cockpit Replacement)

## Objective
Implement a comprehensive monitoring center that allows administrators to query process instances, manage variables, handle incidents, and perform administrative interventions.

## 1. Process Instances Management
- [x] Create `Monitor/Instances` page using `ProTable`
- [x] Implement fetching of active and completed process instances from `/engine-rest/process-instance` and `/engine-rest/history/process-instance`
- [x] Implement instance search (by definition, business key, status, etc.)
- [x] Implement instance detail view:
    - [x] Display basic info and current state
    - [x] Integrate `BpmnHighlightViewer` to show the current progress on the diagram
    - [x] List current active activities/tasks within the instance

## 2. Variable Management
- [x] Within the instance detail view, add a "Variables" tab/section
- [x] Fetch variables for the specific instance from `/engine-rest/process-instance/{id}/variables`
- [x] Implement UI to edit/update variable values (JSON support)
- [x] Implement UI to add new variables

## 3. Incident Management
- [x] Create `Monitor/Incidents` dashboard or tab
- [x] Fetch incidents from `/engine-rest/incident`
- [x] Display incident details (error message, stack trace if available)
- [x] Implement "Retry" action for failed jobs related to incidents

## 4. Admin Intervention
- [x] Implement "Suspend/Activate" actions for process instances
- [x] Implement "Terminate" action for process instances
- [x] Implement "Move/Skip Node" (Process Instance Modification) using `/engine-rest/process-instance/{id}/modification`
- [x] Implement "Forced Transfer" (Assignee change for User Tasks)

## Verification
- [x] Verify that active instances are correctly listed and searchable.
- [x] Verify that variables can be updated and reflected in the engine.
- [x] Verify that incidents are visible and "Retry" works as expected.
- [x] Verify that administrative actions (Suspend, Terminate, Move) correctly affect the process state.
