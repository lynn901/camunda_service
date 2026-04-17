# OpsFlowEngine 前端深度体验优化计划

## 背景与目标 (Objective)
在完成界面汉化和视觉重构的基础上，对照《设计文档》中的核心诉求（运维视角可视化、硬核排障能力、闭环管理），发现当前实现仍有部分关键功能缺失或仅为占位符。本计划旨在补齐并优化这些“硬核”运维能力，使其成为真正可用的生产级控制台。

## 待优化功能点 (Optimization Scope)

### 1. 全局大盘 (Dashboard)
- **引擎状态指示器 (Engine Status)**：在页面头部或大盘增加实时 API 连通性指示器（绿灯/红灯）。
- **模型矩阵 (Model Matrix) 数据完善**：当前卡片缺少按模型统计的活跃/失败实例数对比及成功率。需改造 `camundaService.getStatistics()` 方法，聚合各个模型的历史完成实例与当前失败实例，进而计算并展示成功率进度条。

### 2. BPMN 模型库 (Models & Upload)
- **分类标签注入**：在部署模型 (`UploadModal.tsx`) 时，增加分类（Category）选择下拉框，确保 `camundaService.deployModel()` 能够支持后续通过分类检索。
- **智能业务标识 (TriggerModal)**：在启动实例弹窗中，为 Business Key 提供“自动生成”按钮（例如：`OP-$(Date.now())`），以保障幂等控制要求的强执行。

### 3. 实例干预中心 (Instances Intervention)
- **上下文变量热修复 (Hot Edit Variables)**：
  - 目前的变量列表仅为只读或无关联保存操作的输入框。
  - **改造方案**：增加“保存修改”按钮，并将修改后的变量通过 PUT 请求写入引擎（`updateVariable`）。
- **节点干预 (Retry & Skip)**：
  - 针对带有异常堆栈的节点（Incident），绑定其关联的 `Job Id`。
  - **原点重试 (Retry)**：通过 `camundaService.retryJob(jobId, retries)` 重置任务重试次数，尝试恢复流程。
  - **强制跳过 (Skip)**：放弃失败节点，调用 API 触发跳过。

## 实施步骤 (Implementation Plan)
1. **服务层 (Service Layer)**: 在 `camundaService.ts` 中增加获取引擎版本 (`/version`)、获取特定模型统计数据、更新重试次数 (`/job/{id}/retries`) 的 API 接口。
2. **Dashboard UI**: 在页面右上角增加 Engine Status，修改 `Model Matrix` 卡片，接入真实通过统计数据算出的活跃、异常数值与成功率进度条。
3. **上传弹窗 (Upload Modal)**: 增加 `Category` (基础设施 / 资源调度 / 数据保护) 输入。
4. **实例详情与排障 (Instances View)**:
   - 增加变量热更新的保存交互逻辑。
   - 解析 Incident 中的 `jobId`，并实现重试 (Retry) 按钮真实的 API 调用与界面刷新。

## 预期效果 (Verification)
- 刷新页面时能够看到实时连通的引擎绿灯状态。
- 模型卡片上能直观对比“健康实例”与“异常实例”的比例。
- 在“实例干预”面板中修改变量后，点击“原点重试”能够真正清除报错，使流程节点由红转蓝。