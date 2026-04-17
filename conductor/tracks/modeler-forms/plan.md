# Plan: Phase 4 - Process Modeler & Dynamic Forms

## Objective
Integrate a web-based BPMN modeler and a dynamic form designer to allow users to create process models and associated forms within the enterprise admin system.

## 1. Web Modeler Integration
- [x] Create `Modeler/Bpmn` page.
- [x] Integrate `bpmn-js` modeler with standard properties panel.
- [x] Implement Save/Export functionality (saving to Camunda via Deployment API).
- [x] Add support for custom properties (e.g., Chinese enterprise routing extensions).

## 2. Dynamic Form Designer
- [x] Create `Modeler/Forms` page.
- [x] Integrate a JSON Schema-based form designer (e.g., `form-render` or a simple custom drag-and-drop UI).
- [x] Implement Form Schema storage (saving to a local mock/database or as a resource in Camunda).
- [x] Bind form schema IDs to BPMN `camunda:formKey`.

## 3. Route Configuration
- [x] Update `config/routes.ts` to include sub-routes for `modeler`: `bpmn-modeler` and `form-designer`.

## 4. Internationalization
- [x] Update locale files (`zh-CN` and `en-US`) for the new menu items and page content.

## Verification
- [x] Verify that the BPMN modeler loads correctly and allows editing.
- [x] Verify that models can be saved and deployed to the engine.
- [x] Verify that the form designer can create and save form schemas.
- [x] Verify the binding between forms and process nodes.
