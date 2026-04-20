# Product Guidelines

## Visual Language (Aesthetics)
- **Primary Color:** Indigo-600 (`#4f46e5`).
- **Secondary Colors:**
  - **Success:** Emerald (`#10b981`).
  - **Failure/Warning:** Rose (`#f43f5e`).
  - **Neutral/Background:** Slate (`#64748b`).
- **Typography:** Sans-serif for the general UI; Monospace for technical identifiers (IDs, Business Keys, Cron expressions, Variable names) and logs.
- **Theme:** Dark sidebar with a light, clean workspace for maximum readability.

## UX Principles
- **Modern & Professional:** Use clean layouts with responsive dark-theme support and a strong focus on clarity.
- **Information Density:** Prioritize showing key metrics and critical instance data on the dashboard without cluttering the view.
- **Action-Oriented:** The Intervention Center should empower operators to act quickly with intuitive controls for retries, suspensions, and modifications.
- **Microservices-Aware:** Provide clear visual feedback for the health and load status of distributed external task workers.

## Branding
- **Product Name:** OpsFlowEngine (alternatively referred to as the Workflow Hub).
- **Iconography:** Use `lucide-react` for consistent, minimalist icons.
- **Tone & Voice:** Use professional, technical, and precise language.

## User Interface Conventions
- **Sidebars:** Dark, fixed-width sidebar for navigation.
- **Dashboards:** Use grid-based layouts with color accents to categorize metrics (e.g., Indigo for General, Emerald for Success, Rose for Failures).
- **Execution Chains:** Use `bpmn-js` for high-fidelity rendering of process models, with color-coded nodes indicating execution status.
- **Modals:** Use backdrop-blur and shadow-2xl for focused interactions like deployments or manual triggers.
