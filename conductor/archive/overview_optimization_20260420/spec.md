# Specification: Overall Overview Page Optimization

## Overview
This track focuses on a comprehensive visual and functional overhaul of the "Overall Overview" (整体概览) dashboard. The goal is to align the interface with a warm, editorial design system inspired by Claude (Anthropic), as detailed in `design.md`. Key changes include simplifying the UI by removing non-essential controls and enhancing the model matrix with real-time instance metrics.

## Functional Requirements
- **Design System Implementation:**
  - Apply the **Parchment (#f5f4ed)** background and **Anthropic Near Black (#141413)** primary text colors.
  - Use **Georgia** (serif) for headlines and **system-ui/Arial** (sans) for functional UI elements.
  - Implement **Terracotta Brand (#c96442)** for primary call-to-actions (if any remain).
  - Use **ring-based shadows** (`0px 0px 0px 1px`) for cards and interactive elements.
- **Model Matrix Enhancement:**
  - For every model displayed in the matrix, show two text counters:
    - **Completed:** Total number of finished process instances.
    - **Running:** Total number of currently active process instances.
  - Display "0" if there are no instances for either state.
  - Expand the matrix layout to occupy the freed screen real estate, using larger cards and more generous padding.
- **UI Simplification:**
  - **Remove Control Panel:** Eliminate the entire "Control Panel" (控制面板) feature from the overview page.
  - **Remove Specific Navigation/Action Buttons:**
    - Logs (日志)
    - Alerts (警报)
    - Support (支持)
    - Management Control (管理控制)
  - Ensure the resulting layout feels balanced and centered, following the "editorial pacing" principles in `design.md`.

## Non-Functional Requirements
- **Performance:** Ensure real-time counter updates do not negatively impact page load time or responsiveness.
- **Visual Consistency:** Strictly adhere to the warm-neutral palette and spacing rules from `design.md`.
- **Accessibility:** Maintain high contrast and readable typography despite the parchment background.

## Acceptance Criteria
- [ ] The dashboard background is Parchment (`#f5f4ed`) and text is readable.
- [ ] Headlines use Georgia serif font.
- [ ] Model matrix cards show both "Completed" and "Running" instance counts as text.
- [ ] "0" is displayed for models without activity.
- [ ] The Control Panel is no longer visible.
- [ ] Logs, Alerts, Support, and Management buttons are removed from the interface.
- [ ] The overall layout is spacious and centered.

## Out of Scope
- Implementing custom web fonts (Anthropic Serif/Sans).
- Adding new global metrics or charts (only modifying the existing matrix).
- Modifying process history or instance detail pages (focus is strictly on the Overview).
