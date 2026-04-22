# Implementation Plan: Fix External Worker List Display

## Phase 1: Backend Endpoint Verification and Fix
- [ ] Task: Investigate existing backend controllers to find the external worker endpoint.
- [ ] Task: Write failing test (Red) for the `/api/workflow/workers` endpoint.
- [ ] Task: Implement or fix the `/api/workflow/workers` endpoint (Green).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Endpoint Verification and Fix' (Protocol in workflow.md)

## Phase 2: Frontend API Integration Fix
- [ ] Task: Check frontend API client configuration (e.g., `src/lib/api.ts`).
- [ ] Task: Verify and fix the API call for fetching workers in the `WorkerMonitoring.tsx` component.
- [ ] Task: Run frontend tests (if applicable) and ensure they pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend API Integration Fix' (Protocol in workflow.md)