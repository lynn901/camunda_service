# Plan: Frontend 404 Fixes and Automated Testing

## Objective
Address the 404 errors encountered on every page after local containerized deployment, add unit tests for frontend components, and implement automated end-to-end (E2E) testing for functional pages using Playwright.

## 1. Fix 404 Errors (Deployment)
The 404 errors are caused by Ant Design Pro defaulting to a remote demo server (`https://pro-api.ant-design-demo.workers.dev`) in production builds, and missing Nginx routing for `/api/`.
- **Change `app.tsx`:** Update `request` configuration to set `baseURL: ''` so it uses relative paths, routing to Nginx.
- **Update Nginx Config:** Add `location /api/` to `frontend/nginx.conf` and proxy it to the backend `http://camunda-workflow:8080/api/`.
- **Backend Mock APIs:** Implement basic Spring Boot controllers for `/api/currentUser`, `/api/login/account`, and `/api/outLogin` to return mock data, satisfying Ant Design Pro's layout requirements and preventing immediate 404 redirects to the login screen.

## 2. Frontend Unit Testing
Enhance the existing Jest configuration with comprehensive unit tests.
- **Components:** Add a unit test for a common utility or a basic component (e.g., `tests/components/Footer.test.tsx`).
- **Logic:** Add a unit test for formatting or utility functions.

## 3. Automated Functional Testing (E2E)
Integrate Playwright for robust automated testing of functional pages.
- **Setup:** Install `@playwright/test` in the frontend directory and generate a `playwright.config.ts`.
- **Write Tests:** Create automated tests for the primary functional pages (e.g., `tests/e2e/workbench.spec.ts`, `tests/e2e/login.spec.ts`).
- **Scripts:** Add an `e2e` script to `package.json` for running the Playwright tests locally or in CI.
- **Fix Locale:** Force `test.use({ locale: 'zh-CN' });` in `workbench.spec.ts` so that the default English locale in the headless browser doesn't break tests expecting translated UI elements (e.g., '工作台').

## 4. Verification
- [ ] Build the frontend container and verify that `/api/currentUser` is properly proxied to the backend and returns the mock data without 404s.
- [ ] Run `npm run test` to verify unit tests pass.
- [ ] Run `npx playwright test` to ensure functional pages render correctly and E2E scenarios pass.
