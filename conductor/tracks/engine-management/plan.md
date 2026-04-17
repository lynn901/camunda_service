# Plan: Phase 3 - Engine Management (Admin/Definition Layer)

## Objective
Implement the engine management module to allow administrators to manage process deployments and definitions, including uploading BPMN files, version control, and status toggling.

## 1. Deployment Management
- [x] Create `Engine/Deployments` page using `ProTable`
- [x] Implement fetching deployments from `/engine-rest/deployment`
- [x] Implement BPMN file upload functionality using `/engine-rest/deployment/create`
- [x] Implement deployment deletion

## 2. Process Definitions Management
- [x] Create `Engine/Definitions` page using `ProTable`
- [x] Implement fetching process definitions from `/engine-rest/process-definition`
- [x] Implement version control UI (listing all versions of a definition)
- [x] Implement "Suspend/Activate" toggles for definitions
- [x] Implement XML viewer to display the BPMN XML of a definition

## 3. Route Configuration
- [x] Update `config/routes.ts` to include sub-routes for `engine`: `deployments` and `definitions`

## 4. Internationalization
- [x] Update locale files (`zh-CN` and `en-US`) for the new menu items and page content

## Verification
- [x] Verify that BPMN files can be uploaded and appear in the deployment list.
- [x] Verify that process definitions are correctly listed with their versions.
- [x] Verify that "Suspend/Activate" actions correctly update the definition state in Camunda.
- [x] Verify that the XML viewer correctly displays the BPMN content.
