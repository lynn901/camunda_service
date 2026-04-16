# Tech Stack Profile: Enterprise Frontend Rewrite

由于本项目旨在替代 Camunda 的所有原生控制台，并支持高度复杂的交互（如中国式退回、加签、动态表单设计器和 BPMN 建模器），我们需要一个极其健壮且高度可扩展的技术栈。

## Frontend Framework & UI
*   **Core:** React 18 + TypeScript + Vite
*   **Admin Template:** Ant Design Pro (React)
    *   *Why:* 提供了开箱即用的高级布局、多标签页、完善的权限路由控制和丰富的数据展示组件（高级表格、高级表单、统计卡片），非常适合构建这 6 大复杂的后台模块。
*   **Styling:** Tailwind CSS + Ant Design Theme overrides

## BPMN & Workflow Capabilities
*   **Diagram Viewer & Modeler:** `bpmn-js` 
*   **Properties Panel:** `@bpmn-io/properties-panel` + `camunda-bpmn-moddle` (用于解析和编辑 Camunda 原生扩展属性如 Listener、Form Key 等)。
*   **Customization:** 深度定制覆盖原生 bpmn-js 的 Renderer 和 Context Pad，以支持如“耗时热力图”、“审批流转高亮”等功能。

## State Management & Data Fetching
*   **Global State:** Zustand (用于管理租户、用户信息、全局流程设计器状态)。
*   **Data Fetching:** SWR 或 React Query (配合现有的 `authFetch` 拦截器)，处理 Camunda REST API 的海量轮询和缓存。

## Forms & Dynamic Rendering
*   **Form Designer:** 基于 `formily` 或类似的开源 React 拖拽表单引擎，结合 Ant Design 组件库，生成 JSON Schema 并在 User Task 节点中进行渲染。

## Backend (Existing)
*   **Engine:** Camunda 7.20.0 (Spring Boot)
*   **API:** Camunda Native REST API (`/engine-rest/**`) 结合自定义的 Business API (`/api/workflow/**`) 处理复杂的聚合操作（如“中国式退回”需要计算历史节点并手动迁移 Execution）。
