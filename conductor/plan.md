# Master Implementation Plan: Enterprise Frontend Rewrite

## Background & Scope
The goal is to replace the existing basic React frontend with a comprehensive, enterprise-grade admin system that covers 6 core workflow modules, customized for Chinese enterprise requirements. We will adopt a **Phased Module Delivery** strategy using an **Enterprise Admin Template** (e.g., Ant Design Pro).

## Proposed Solution: Phased Delivery Strategy

### Phase 1: Foundation & Workbench (User Center)
*   **Setup:** Bootstrap the new Ant Design Pro project. Establish routing, Layouts, global state (Zustand), and the `authFetch` interceptor.
*   **IAM Integration:** Implement dummy/local Organization & Permission mapping (Module 5 basics) to support Tenant and User context.
*   **My To-Do & My Done:** Build the core task lists with advanced search.
*   **Approval Panel:** Implement standard actions (Approve, Reject).
*   **Diagram View:** Integrate `bpmn-js` viewer to highlight the current active node in My To-Do.

### Phase 2: Operations Monitoring (Cockpit Replacement)
*   **Process Instances:** Build the global instance query and detailed view.
*   **Variable Management:** UI to view and modify instance variables dynamically.
*   **Incident Management:** Dashboard to view errors and trigger "Retry Job".
*   **Admin Intervention:** Implement forced transfer, termination, and node skipping (using process instance modification API).

### Phase 3: Engine Management (Admin/Definition Layer)
*   **Deployments:** UI for `.bpmn` uploads and deployment management.
*   **Definitions:** Version control, Suspend/Activate toggles, XML viewing.

### Phase 4: Process Modeler & Dynamic Forms
*   **Web Modeler:** Deep integration of `bpmn-js` modeler with Camunda properties panel.
*   **Dynamic Forms:** Integrate a JSON Schema-based form designer. Bind form schema IDs to BPMN `camunda:formKey`.
*   **Advanced Chinese Routing:** Extend properties panel to configure rules for Countersign (加签) and Custom Reject (退回).

### Phase 5: Statistics Dashboard & Refinement
*   **Heatmaps:** Extend `bpmn-js` viewer to overlay execution times (green/yellow/red) based on history API data.
*   **Analytics:** ECharts/AntV for trend lines and timeout rankings.
*   **Complex Actions:** Implement the backend/frontend logic for "Reject to specific node" (using `process-instance/{id}/modification`).

## Verification
*   Each phase will be verified against the existing `order-process` and `cloud-host-workflow` engine data.
*   Testing will ensure the new frontend seamlessly authenticates and fetches data exactly like the old one, but with advanced UI capabilities.

## Next Action
Once this master plan is approved, we will proceed to execute **Phase 1** (Bootstrapping the Enterprise Template and Workbench).
