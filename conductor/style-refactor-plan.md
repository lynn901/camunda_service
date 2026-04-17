# Frontend Style Refactoring Plan (Tailwind v4 Adaptation)

## Objective
Refactor the frontend style implementation to correctly apply the **Claude (Anthropic) design system** (from `design.md`) by migrating the current `tailwind.config.js` to Tailwind CSS v4's CSS-based `@theme` configuration.

## Background
The project currently uses `@tailwindcss/postcss` for Tailwind CSS v4. However, the custom theme colors (like `parchment`, `terracotta`), typography, and shadows were defined in a legacy `tailwind.config.js`. In v4, this file is mostly ignored or requires a specific compatibility layer. As a result, the application's visual styling is broken and does not reflect the intended warm, editorial aesthetics.

## Proposed Solution
1. **Remove Old Configuration**: Delete `frontend/tailwind.config.js`.
2. **Update Main CSS**: Rewrite `frontend/src/index.css` to use the `@import "tailwindcss";` directive and define all custom design tokens within an `@theme` block.
    - Map colors (e.g., `--color-parchment: #f5f4ed`).
    - Map typography (e.g., `--font-serif: Georgia, serif`).
    - Map border radii and shadows (`--radius-comfortable: 8px`, `--shadow-ring: ...`).
3. **Refine Global Styles**: Re-establish the baseline body styles (`background-color`, `font-family`, `line-height`) using the newly defined CSS variables.
4. **Audit Components**: Review key UI components (`Card`, `Button`, `Sidebar`, `Instances`, `Dashboard`) to ensure utility classes correctly align with the new v4 variable names. In v4, variables injected via `@theme` automatically map to utilities (e.g., `--color-parchment` maps to `bg-parchment`, `text-parchment`).

## Implementation Steps
1. Delete `frontend/tailwind.config.js`.
2. Replace content of `frontend/src/index.css` with the new Tailwind v4 theme definitions.
3. Perform a quick regex-based text search/replace across React components if any class names conflict with v4 defaults (though the direct mapping from `@theme` should preserve the v3 class names exactly).
4. Run `npm run build` in `frontend` to verify the CSS is correctly compiled.

## Verification
- Successful frontend build without PostCSS warnings.
- The UI matches the Anthropic editorial look: warm parchment background, terracotta accents, large rounded corners, and shadow rings.
