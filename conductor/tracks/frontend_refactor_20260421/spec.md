# Specification: Frontend Refactor and Backend Integration

## Overview
This track focuses on refactoring the existing frontend monitoring console based on the core logic and visual style defined in `base.js`. The goal is to provide a modern, high-performance interface that integrates seamlessly with the Spring Boot/Camunda backend to manage and monitor business processes.

## Functional Requirements
- **Process List Dashboard:** Real-time display of all process instances with filtering by status and date.
- **Process Visualization:** Integrated BPMN 2.0 viewer using `bpmn-js` to show current process execution paths.
- **Task Management:** Interface for viewing, claiming, and completing user tasks.
- **Instance Details:** Deep dive into specific process instances, showing variables, history, and activity logs.
- **Metrics Overview:** High-level dashboard showing engine health and process throughput.

## Non-Functional Requirements
- **Performance:** Sub-second page transitions using Vite and React-Query.
- **Maintainability:** Modular React components following the style guidelines in `conductor/code_styleguides/`.
- **User Experience:** Dark-theme support and Sanity-inspired design principles.
- **Reliability:** Idempotent operations for all state-modifying actions.

## Acceptance Criteria
- [ ] Frontend successfully displays process instances fetched from the backend.
- [ ] BPMN diagrams render correctly for deployed processes.
- [ ] User can complete tasks through the custom UI.
- [ ] Visual style matches the guidelines in `design.md`.
- [ ] Integration tests verify end-to-end connectivity between frontend and backend.
