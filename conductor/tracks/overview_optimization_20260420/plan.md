# Implementation Plan: Overall Overview Page Optimization

## Objective
To refactor the "Overall Overview" dashboard to match the Claude-inspired design system (`design.md`) and enhance the model matrix with instance metrics while simplifying the UI.

## Key Files & Context
- `frontend/src/pages/Dashboard.tsx`: Main dashboard page.
- `frontend/src/components/ui/WidgetGrid.tsx`: Model matrix container.
- `frontend/src/components/ui/Card.tsx`: Individual matrix cards.
- `frontend/src/services/camundaService.ts`: Data fetching service.
- `frontend/src/App.css`, `frontend/src/index.css`: Global styles.
- `design.md`: Design source of truth.

---

## Phase 1: Preparation & UI Cleanup [checkpoint: ea4223c]
*Focus: Removing non-essential features and preparing for the visual overhaul.*

- [x] Task: Remove Control Panel and interactive buttons (Logs, Alerts, Support, Management) [e29fa44]
    - [ ] Identify and remove `ControlPanel` component usage in `Dashboard.tsx`.
    - [ ] Remove sidebar or header navigation links for Logs, Alerts, Support, and Management.
    - [ ] **TDD:** Write tests in `Dashboard.test.tsx` to verify these elements are no longer present.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Preparation & UI Cleanup' (Protocol in workflow.md) [ea4223c]

## Phase 2: Visual Style Overhaul [checkpoint: 8795720]
*Focus: Implementing the Claude-inspired design system (Parchment theme).*

- [x] Task: Global Palette and Typography Implementation [d557e02]
    - [ ] Update `index.css` or `App.css` to use Parchment (`#f5f4ed`) background and Near Black (`#141413`) text.
    - [ ] Configure `Georgia` as the primary serif font and `system-ui/Arial` as the sans-serif font.
    - [ ] **TDD:** Add snapshot tests or style assertion tests to ensure theme colors are applied correctly.
- [x] Task: Card and Layout Refactor [ffd1b3c]
    - [ ] Update `Card.tsx` to use the ring-based shadow (`0px 0px 0px 1px #f0eee6`).
    - [ ] Refactor `Dashboard.tsx` to use generous section spacing (80-120px) and a centered layout.
    - [ ] **TDD:** Verify the layout structure and card styles in `Card.test.tsx` or `Dashboard.test.tsx`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Visual Style Overhaul' (Protocol in workflow.md) [8795720]

## Phase 3: Model Matrix Enhancements
*Focus: Adding instance metrics and expanding the matrix layout.*

- [x] Task: Service Update for Metrics [7a5d2b4]
    - [ ] Update `camundaService.ts` to include methods for fetching "Completed" and "Running" instance counts per model.
    - [ ] **TDD:** Write unit tests in `camundaService.test.ts` to mock and verify the new data fetching logic.
- [x] Task: Update Matrix Cards with Counters [a4b335f]
    - [ ] Modify `Card.tsx` (or the specific model card) to accept and display "Completed" and "Running" counts.
    - [ ] Implement the "Show Zeros" logic as text counters.
    - [ ] **TDD:** Write tests in `MetricCards.test.tsx` to verify counters are displayed correctly.
- [x] Task: Expand Matrix Layout [3242f76]
    - [ ] Adjust `WidgetGrid.tsx` and card styles to use larger cards and more padding, utilizing the freed space.
    - [ ] **TDD:** Verify grid responsiveness and spacing in `WidgetGrid.test.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Model Matrix Enhancements' (Protocol in workflow.md)

## Phase 4: Final Polish & Verification
*Focus: Ensuring visual consistency and "editorial pacing".*

- [ ] Task: Final Visual & Spacing Pass
    - [ ] Refine "editorial pacing" by adjusting margins and line-heights (1.60 for body text).
    - [ ] Ensure all neutrals are warm-toned (yellow-brown undertones).
- [ ] Task: Project-wide Quality Check
    - [ ] Run all frontend tests (`npm test`).
    - [ ] Verify mobile responsiveness of the updated overview page.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Polish & Verification' (Protocol in workflow.md)
