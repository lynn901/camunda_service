# Specification: Overall Overview (整体概览) Redesign

## 1. Overview
The goal of this track is to redesign the existing "Global Dashboard" page and rename it to "Overall Overview" (整体概览). The new page will serve as a centralized, high-level monitoring dashboard for the Camunda-based workflow engine. It will provide a comprehensive view of process statistics, task metrics, and system health in a customizable widget-grid layout.

## 2. Functional Requirements

### 2.1 Metrics Display (Widget Grid)
The page MUST implement a flexible grid layout (Widget Grid) displaying the following key metrics:
- **Process Stats:** Total process instances, running instances, completed instances, and suspended instances.
- **Task Metrics:** Task backlogs, average task completion times, and failure rates (incidents).
- **System Health:** Basic system load metrics, memory usage, and active database connections (if available via Camunda/Spring Boot Actuator).

### 2.2 Interactive Features
- **Date Filtering:** Users MUST be able to filter the displayed metrics by a specific date or time range.
- **Auto-Refresh:** The dashboard MUST support an auto-refresh mechanism to update data periodically without manual intervention.
- **Drill-down Links:** Clicking on specific metrics (e.g., "Suspended Instances" or "Task Backlogs") MUST navigate the user to a detailed view or a pre-filtered list (e.g., the Instances or Tasks page).

### 2.3 Backend API Enhancements
- Develop new Spring Boot REST endpoints or enhance existing `WorkflowController` / `WorkflowService` methods to aggregate and serve the required metrics (Process Stats, Task Metrics, System Health) efficiently, as existing APIs are insufficient.

## 3. Non-Functional Requirements
- **Performance:** Aggregation queries on the backend MUST be optimized to handle large volumes of historic data without degrading engine performance.
- **Responsiveness:** The Widget Grid layout MUST be responsive and adapt to different screen sizes.

## 4. Acceptance Criteria
- The navigation menu is updated from "Global Dashboard" to "Overall Overview" (整体概览).
- The new page displays Process Stats, Task Metrics, and System Health in a grid layout.
- Date filtering correctly updates the metrics.
- The auto-refresh feature functions correctly.
- Clicking on a metric navigates to the correct detailed view.
- New backend APIs return aggregated data correctly and efficiently.

## 5. Out of Scope
- Detailed reporting or data exports (e.g., CSV/PDF generation).
- Modifying individual process definitions from the overview page.