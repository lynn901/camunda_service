# OpsFlowEngine 前端控制台功能实现计划

## 背景与目标 (Objective)

基于提供的 `OpsFlowEngine` (React 19 + Vite + Tailwind CSS/Lucide Icons) 参考设计，构建一个监控、管理和干预 Camunda 7 工作流的全功能运维控制台。该控制台支持查看流程全局状态、实例管理（包含 AI 排障辅助）、BPMN 模型管理（包含 AI 智能参数生成）以及外部 Worker 节点监控。实施策略采用“垂直切片”（按功能模块端到端联调推进）。

## 功能范围与页面拆解 (Scope & Features)

控制台采用左右布局（侧边栏 + 主内容区），共分为 4 大核心模块：

### 1. 全局大盘 (Dashboard)

- **KPI 指标卡片**：展示活跃实例数、24H 成功/恢复数、异常挂起数。
- **工作流模型矩阵 (Model Matrix)**：按卡片形式列出系统中的流程模型。
  - 展示模型分类、活跃数、失败数、成功率进度条。
  - 卡片 hover 时提供“手动触发”快捷入口。

### 2. BPMN 模型库 (Model Repository)

- **模型列表视图**：展示已部署模型的标识、版本号和部署时间。
- **操作列**：
  - **部署新模型 (Upload Modal)**：支持上传 `.bpmn` 文件的弹窗交互。
  - **手动触发实例 (Trigger Modal)**：
    - 包含 Business Key 输入。
    - JSON 编辑器显示和修改最终参数，并提交启动请求。

### 3. 实例干预中心 (Instance Intervention)

- **多模型左侧列表筛选**：支持通过下拉框按模型过滤实例。展示实例列表及其状态（Running, Failed）。
- **右侧详情与控制台**：
  - **顶部控制条**：显示实例状态、开始时间，提供挂起 (Suspend) 和终止 (Terminate) 按钮。
  - **执行链路 (Execution Pipeline)**：垂直时间轴形式展示步骤（已完成、运行中、失败）。
    - 针对失败节点，展示异常堆栈日志 (Exception Stack Trace)。
    - 提供运维重试 (Retry Event) 或 强制跳过 (Skip) 等操作。
  - **上下文变量面板 (Context Variables)**：最右侧展示并支持在线热修改流程变量。

### 4. 外部 Worker 节点 (External Task Workers)

- **Worker 指标监控**：显示在线、掉线、锁定任务数等统计数据。
- **节点注册列表**：表格展示 Worker ID、部署节点、订阅队列 (Topics) 和最后心跳时间。
- **运维操作**：对异常锁定任务的 Worker 提供“释放锁 (Unlock)”和“隔离挂起”功能。

## 实施阶段计划 (Phased Implementation Plan)

按照**垂直切片**（优先跑通核心业务流的端到端实现）的策略推进：

### Phase 1: 基础设施与应用外壳 (App Shell & Layout)

- 提取并封装通用的 UI 组件：`Sidebar`, `Header`, KPI Card 等。
- 引入路由系统 (`react-router-dom`)，建立 4 个主模块的空页面及导航联动。
- 配置 Tailwind CSS (如果尚未启用) 和全局自定义样式 (`index.css`)。
- 集成 `lucide-react` 图标库。

### Phase 2: BPMN 模型库与实例触发 (部署与启动)

- **UI & 交互**：完成“模型库”列表页、部署上传弹窗 (Upload Modal) 以及实例触发弹窗 (Trigger Modal)。
- **后端对接**：对接 Camunda REST API (`/engine-rest/deployment`, `/engine-rest/process-definition`) 获取真实模型数据。

### Phase 3: 实例干预中心 (监控与恢复)

- **UI & 交互**：实现左右分屏的实例列表与执行链路时间轴视图。
- **后端对接**：
  - 获取运行中和失败的流程实例 (`/engine-rest/history/process-instance` 或 `/engine-rest/process-instance` 和 `/engine-rest/incident`)。
  - 获取实例当前变量 (`/engine-rest/process-instance/{id}/variables`) 并支持在线修改保存。
- **运维操作对接**：实现重试事件和跳过节点的 Camunda API 调用（如清理 incident 并重置 retry 数）。

### Phase 4: 全局大盘与 Worker 监控 (统计与节点维护)

- **UI & 交互**：完成大盘指标卡片、模型矩阵视图，以及 Worker 节点监控列表。
- **后端对接**：
  - 对接 `/engine-rest/external-task` 和历史记录，聚合汇总全局数据和实例分布。
  - 对接 Worker 相关的解锁接口 (`/engine-rest/external-task/{id}/unlock`) 等运维功能。

## 验证与架构要求

- 前端栈：React 19 + Vite + TypeScript (依据原有目录结构)。
- 依赖项：`react-router-dom`, `lucide-react`, `tailwindcss` (如未配置需补充)。
- 接口代理：开发环境在 `vite.config.ts` 中配置反向代理指向后端的 8080 端口。
- 采用直接调用 `fetch` 的方式对接 Gemini API（需提前配置环境变量以保障 Key 安全）。
