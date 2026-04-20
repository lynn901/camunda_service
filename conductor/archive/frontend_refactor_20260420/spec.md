# Specification: Frontend Refactoring and Docking

## Overview
This track focuses on a comprehensive refactoring of the existing frontend logic contained within `base.js` into the project's React 19 architecture, while achieving full functional parity and API integration (docking).

## Track Goal
To migrate the core functionalities of the Camunda Workflow Service frontend from legacy `base.js` scripts to modular React components, while retaining existing styling, and successfully docking all features with the appropriate backend endpoints.

## Functional Requirements
- **Process Monitoring:** Implement real-time monitoring of running and active process instances.
- **Task Management:** Rebuild interfaces for managing user tasks and handling external tasks.
- **Metrics & Dashboard:** Migrate overall system statistics and data visualization into the new architecture.
- **History & Auditing:** Re-implement the auditing interface to display completed processes and historical execution paths.
- **API Docking:** Integrate components utilizing a "Mixed Approach," combining the Custom Workflow API (`/api/workflow`) for simplified operations and the Native Camunda REST API (`/engine-rest`) for advanced features.

## Non-Functional Requirements
- **Architecture:** The code must follow the new React + Vite + TypeScript architecture.
- **Styling:** The refactoring will strictly focus on logic and React component structure; existing styling will be retained to minimize scope creep.
- **Reliability:** The end result must achieve 1:1 functional parity with the original `base.js` implementation.

## Acceptance Criteria
- [ ] Process definitions and running instances are visible and correctly updated.
- [ ] Users can manage tasks without errors.
- [ ] System metrics dashboard displays accurate data derived from the backend APIs.
- [ ] Completed processes and history can be audited.
- [ ] All features from `base.js` are fully functional within the new React application.

## Out of Scope
- Migrating to the Vanilla CSS dark theme design system (this will be handled in a separate styling refactor track).
- Introduction of new features not present in the original `base.js`.