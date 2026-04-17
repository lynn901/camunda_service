# Fullstack Refactor & Frontend Implementation Plan

## Objective
Optimize the project directory structure by clearly separating the Camunda backend from the new React frontend, and build the foundation for the new frontend console using the agreed-upon architecture (React + Vite, Vanilla CSS, React Context).

## Background & Motivation
Currently, the Spring Boot application resides at the root of the repository. Adding a full React SPA frontend at the root alongside Java files would create clutter and mix build toolings. By moving the backend files into a `backend/` directory and creating a separate `frontend/` directory, we achieve a clean, maintainable fullstack monorepo structure.

## Scope & Impact
1. **Backend Move**: All Spring Boot files (`src/`, `pom.xml`, `Dockerfile`, etc.) will move to `backend/`. This requires updating `docker-compose.yml` to point to the new build context.
2. **Frontend Creation**: A new `frontend/` directory will be initialized with Vite (React + TS), configured with the Vanilla CSS variables from `design.md`, and set up with React Context for state management.
3. **Documentation Update**: `README.md` and `GEMINI.md` will be updated to reflect the new structure.

## Proposed Solution
- **Frontend Architecture**: React 19 + Vite (SPA)
- **Styling**: Vanilla CSS matching the Sanity-inspired dark theme (`#0b0b0b` canvas, `waldenburgNormal` and `IBM Plex Mono` typography).
- **State Management**: React Context for global state (e.g., user session, theme).
- **Process Visualizer**: Use `bpmn-js` for rendering BPMN diagrams.

## Implementation Plan

### Phase 1: Directory Restructuring
1. Create `backend/` and `frontend/` directories.
2. Move backend artifacts (`src`, `pom.xml`, `Dockerfile`, `.dockerignore`, `test_ops_failure.bpmn`) into `backend/`.
3. Update `docker-compose.yml` to change the backend build context to `./backend` and add a new service `camunda-frontend` (port 3000:80) pointing to `./frontend`.

### Phase 2: Frontend Scaffolding
1. Initialize the Vite project in `frontend/`: `npm create vite@latest . -- --template react-ts`.
2. Configure `vite.config.ts` (e.g., adding proxy to backend `http://localhost:8080` for local dev).
3. Create the global CSS file (`src/index.css`) containing the CSS variables defined in `design.md` (colors, spacing, typography).
4. Set up the basic layout: Top Navigation, main content area, and routing (using `react-router-dom`).
5. Set up a React Context provider for global state management.
6. Create the `Dockerfile` for the frontend (multi-stage build using Node for building and Nginx for serving).

### Phase 3: Documentation
1. Update `README.md` with instructions for the new directory structure.
2. Update `GEMINI.md` to map out the new structure.

## Verification
- Run `mvn clean package` in `backend/` to ensure successful build.
- Run `npm run build` in `frontend/` to ensure frontend builds correctly.
- Run `docker-compose up -d --build` from the root and verify both services start up without errors.
- Confirm that the frontend is accessible at `http://localhost:3000` and the backend API is accessible at `http://localhost:8080/actuator/health`.

## Migration & Rollback
Since this is a structural change to a local repository without complex database migrations, we can revert via Git (`git restore .` and `git clean -fd` for untracked files) if any structural issues arise.
