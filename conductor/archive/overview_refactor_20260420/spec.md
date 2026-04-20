# Track Specification: Overall Overview Page Refactor

## 1. Overview
Refactor the "Overall Overview" (整体概览) dashboard page based on the provided Stitch design references (`@.stitch/_1/screen.png` and `@.stitch/_1/code.html`). The goal is to modernize the UI, improve data visualization, and introduce new interactive features without requiring backend API changes.

## 2. Functional Requirements
- **Data Integration:** The dashboard must rely entirely on existing backend API endpoints (e.g., `/api/workflow/metrics`) to populate the metrics and visualizations.
- **Component Refactoring:** Update and enhance the existing UI components (`WidgetGrid.tsx`, `MetricCards.tsx`) to match the new design rather than building entirely new standalone components.
- **Interactivity Enhancements:**
  - Implement real-time automatic refresh for metrics data.
  - Add "click-to-filter" functionality, allowing users to click on specific metrics to navigate to a pre-filtered list of workflow instances.
  - Implement a feature to export the overview data.

## 3. Non-Functional Requirements
- **Responsive Design:** The primary layout optimization target is Desktop screens. The layout must display flawlessly on large monitors.
- **Performance:** Ensure real-time refresh does not cause excessive API load or frontend freezing.

## 4. Acceptance Criteria
- [ ] The overview page visually matches the Stitch design references.
- [ ] Existing `WidgetGrid.tsx` and `MetricCards.tsx` components are successfully updated.
- [ ] Metrics update automatically in real-time.
- [ ] Clicking a metric navigates the user to a filtered view of instances.
- [ ] Users can export the overview data.
- [ ] The layout is fully optimized and functional on Desktop resolutions.

## 5. Out of Scope
- Backend API modifications or new aggregations.
- Dedicated optimizations for Tablet or Mobile devices.
- Refactoring of pages other than the Overall Overview dashboard.