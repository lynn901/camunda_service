# Product Guidelines

## Documentation Style
- **Clarity and Precision:** Technical documentation should be concise and unambiguous, focusing on actionable steps and API specifications.
- **Consistent Terminology:** Use standardized Camunda and BPMN terminology (e.g., Process Instance, Service Task, External Task).

## UX & UI Principles
- **Efficiency Over Aesthetics:** Prioritize clear information hierarchy and fast data access for monitoring dashboards.
- **Minimalist Design:** Follow the "Sanity-inspired" visual system: high-contrast typography, dark theme, and precise spacing.
- **Feedback Loops:** Provide immediate visual feedback for user actions (e.g., starting a process, completing a task).

## Development Philosophy
- **Separation of Concerns:** Keep the workflow engine (logic/orchestration) separate from the business logic (external services).
- **Idempotency:** All callbacks and task handlers must be designed to be idempotent to ensure reliability in distributed systems.
- **Observability:** Ensure every significant event is logged and visible within the console for easier troubleshooting.