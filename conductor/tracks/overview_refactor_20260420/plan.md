# Implementation Plan: Overall Overview Page Refactor

## Phase 1: Setup and Design Analysis [checkpoint: 8cfb614]
- [x] Task: Review the Stitch design references (`@.stitch/_1/screen.png`, `@.stitch/_1/code.html`) to identify structural differences and required CSS changes. 8cfb614
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup and Design Analysis' (Protocol in workflow.md) 8cfb614

## Phase 2: Component Refactoring (WidgetGrid & MetricCards) [checkpoint: 345ccbb]
- [x] Task: Write failing unit tests for the updated `MetricCards.tsx` layout and expected data rendering based on the new design. 6712462
- [x] Task: Implement the updated `MetricCards.tsx` component, ensuring tests pass. 52a27e8
- [x] Task: Write failing unit tests for the updated `WidgetGrid.tsx` layout and grid structure. 395ab7a
- [x] Task: Implement the updated `WidgetGrid.tsx` component, ensuring tests pass. cbe0ca5
- [x] Task: Conductor - User Manual Verification 'Phase 2: Component Refactoring (WidgetGrid & MetricCards)' (Protocol in workflow.md) 345ccbb

## Phase 3: Interactivity (Real-time Refresh, Filtering, Export) [checkpoint: 1d524b5]
- [x] Task: Write failing unit tests for the real-time automatic refresh logic (e.g., polling or WebSocket depending on existing API setup) in the Dashboard page. 43815ac
- [x] Task: Implement real-time automatic refresh, ensuring tests pass. cbe0ca5
- [x] Task: Write failing unit tests for the "click-to-filter" functionality, ensuring correct navigation to the Instances view with applied query parameters. 5d3ebda
- [x] Task: Implement the "click-to-filter" functionality, ensuring tests pass. 5d3ebda
- [x] Task: Write failing unit tests for the data export feature (e.g., CSV or JSON export). 92fbab4
- [x] Task: Implement the data export feature, ensuring tests pass. 369cf8e
- [x] Task: Conductor - User Manual Verification 'Phase 3: Interactivity (Real-time Refresh, Filtering, Export)' (Protocol in workflow.md) 1d524b5

## Phase 4: Assembly and Desktop Optimization
- [ ] Task: Assemble the refactored components in `Dashboard.tsx` and ensure correct data wiring.
- [ ] Task: Apply Desktop-first CSS styling and layout adjustments to match the design flawlessly on large monitors.
- [ ] Task: Refactor any redundant CSS/code and confirm the page renders correctly in the browser without regressions.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Assembly and Desktop Optimization' (Protocol in workflow.md)