# Plan: Phase 5 - Statistics Dashboard & Refinement

## Objective
Implement analytics dashboards and advanced visualization features, including heatmaps for process execution and performance metrics using charts.

## 1. Analytics Dashboard
- [x] Create `Analytics/Dashboard` page.
- [x] Integrate `@ant-design/plots` for data visualization.
- [x] Implement metrics for:
    - [x] Process instance status distribution (Active, Completed, Terminated).
    - [x] Task completion trends (daily/weekly).
    - [x] Average execution time per process definition.
    - [x] Timeout/Incident rankings.

## 2. Process Heatmaps
- [x] Extend `BpmnHighlightViewer` to support "Heatmap" mode.
- [x] Fetch historical execution data from `/engine-rest/history/activity-instance`.
- [x] Calculate execution intensity or duration per node.
- [x] Apply color overlays (Green/Yellow/Red) to BPMN nodes based on performance data.

## 3. Complex Actions Refinement
- [x] Enhance "Reject" logic to support "Reject to specific node" using the Modification API.
- [x] Implement UI for selecting a target node from the process history in the Reject dialog.

## 4. Route Configuration
- [x] Update `config/routes.ts` to ensure `analytics` sub-routes are correctly defined.

## 5. Internationalization
- [x] Update locale files (`zh-CN` and `en-US`) for the new menu items and page content.

## Verification
- [x] Verify that charts correctly display data from the Camunda engine.
- [x] Verify that BPMN heatmaps correctly reflect node execution times.
- [x] Verify that "Reject to specific node" correctly moves the process instance.
