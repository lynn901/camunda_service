# Specification: Fix External Worker List Display

## Overview
The "Worker Monitoring" page (`/workers`) fails to display the list of registered external workers. The root cause is a 404 Not Found error when the frontend attempts to fetch data from the `/api/workflow/workers` endpoint.

## Problem Description
- **Reproduction Steps:** Navigate to the `/workers` page in the application. The registered node list is empty.
- **Error Logs:** The browser console or network tab shows a 404 error for the API request.

## Expected Behavior
The frontend should successfully fetch the list of active/registered external workers from the backend API and display them.

## Acceptance Criteria
- [ ] The backend provides a valid endpoint for fetching external workers.
- [ ] The frontend successfully calls the correct API endpoint without a 404 error.
- [ ] The `/workers` page accurately displays the list of registered external workers.