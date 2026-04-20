# Product Guidelines

## Prose Style
- **Clear & Concise:** Avoid jargon unless necessary; use active voice.
- **Action-Oriented:** Focus on the "why" and "how" behind each decision.
- **Consistent:** Use standard industry terminology (BPMN, DMN, Webhooks, etc.).

## Branding & UX Principles
- **Modern & Professional:** Clean layouts with dark-theme support.
- **User-Centric:** Information-dense dashboards with high contrast and readable typography.
- **Informative:** Provide real-time feedback for long-running operations.
- **Accessibility:** Adhere to WCAG 2.1 standards for all UI components.

## Development Workflow
- **Security First:** Protect secrets and credentials; use standard security protocols (OAuth, Basic Auth).
- **Test-Driven:** Maintain >80% test coverage for all core engine services and APIs.
- **Documentation:** Every feature must be documented in the repository.
- **Idempotency:** All business endpoints must be idempotent to ensure reliable retries.
- **Asynchronicity:** Use BPMN's asynchronous boundaries for persistent state management.
