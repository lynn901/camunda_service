# Implementation Plan: Fix External Worker List Display

## Phase 1: Backend Endpoint Verification and Fix [checkpoint: 00ecfba]
- [x] Task: Investigate existing backend controllers to find the external worker endpoint.
- [x] Task: Write failing test (Red) for the `/api/workflow/workers` endpoint.
- [x] Task: Implement or fix the `/api/workflow/workers` endpoint (Green).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend Endpoint Verification and Fix' (Protocol in workflow.md)

## Phase 2: Frontend API Integration Fix [checkpoint: 2422d05]
- [x] Task: Check frontend API client configuration (e.g., `src/lib/api.ts`).
- [x] Task: Verify and fix the API call for fetching workers in the `WorkerMonitoring.tsx` component.
- [x] Task: Run frontend tests (if applicable) and ensure they pass.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend API Integration Fix' (Protocol in workflow.md)