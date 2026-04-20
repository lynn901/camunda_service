# OpsFlowEngine Product Design Document

## 1. Overview
OpsFlowEngine is a modern, high-performance monitoring and intervention dashboard designed for Camunda 7.20. It serves as a centralized "Workflow Hub" for microservices, providing real-time visibility and management capabilities for business processes.

## 2. Design Principles
- **Modern & Professional:** Clean layouts with dark-theme support and a focus on clarity.
- **User-Centric:** Information-dense dashboards with intuitive navigation and high contrast.
- **Action-Oriented:** Empowering operators to intervene and resolve issues quickly.
- **Microservices-Aware:** Native support for monitoring external task workers and high-scale process instances.

## 3. Core Modules

### 3.1 Dashboard (Overview)
Provides a high-level health report of the entire workflow ecosystem.
- **Metrics:** Active instances, completion rates, failure counts, and active schedules.
- **Time Range Filtering:** Data visualization for the last 1h, 24h, 7d, or 30d.
- **Model Matrix:** Quick status overview of each deployed BPMN model.

### 3.2 Intervention Center (Instances)
The primary hub for diagnosing and fixing failing process instances.
- **Instance List:** Filterable list of all running or failed instances.
- **Execution Path:** Visual representation of the process execution chain, highlighting the current state and any failures.
- **Error Diagnostics:** Direct access to error logs and stack traces for failed steps.
- **Operations:** Supports instance suspension, deletion, node modification (modification API), and retry management.
- **Variable Management:** Real-time viewing and "hot" modification of process variables.

### 3.3 Execution History
An archive for post-mortem analysis and auditing of completed or terminated processes.
- **Read-Only Paths:** Historical execution chains with timing information for each step.
- **Variable Snapshots:** Final state of all process variables upon completion.
- **Duration Analysis:** Insight into how long each step and the overall process took.

### 3.4 BPMN Model Library
Centralized management of the workflow's "source code."
- **Deployment:** Web-based interface for uploading and deploying BPMN 2.0 XML files.
- **Version Control:** Tracking of multiple versions for each model.
- **Manual Triggering:** Interface for manually launching process instances with custom JSON payloads and business keys.

### 3.5 Scheduled Tasks (Schedules)
Cron-based automation for repetitive business processes.
- **Cron Configuration:** Standard Cron expression support for flexible scheduling.
- **Status Monitoring:** Tracking of active/paused states and next scheduled run times.
- **Failure Tracking:** Visibility into failed scheduled triggers.

### 3.6 External Worker Monitoring
Visibility into the health of the microservices processing external tasks.
- **Worker Status:** Real-time tracking of online, high-load, or offline workers.
- **Task Locking:** Monitoring of tasks currently locked by specific workers.
- **运维操作:** Ability to forcefully unlock tasks from dead workers or isolate problematic nodes.

### 3.7 Audit Logs
A tamper-evident record of all human and system interventions.
- **Operation Tracking:** Records of instance retries, variable updates, and administrative actions.
- **Detailed Context:** Operator identity, timestamp, action type, and target resource.

## 4. Technical Architecture
- **Frontend:** React with TypeScript, Vite, Tailwind CSS, and Lucide-React for icons.
- **State Management:** React-Query for robust asynchronous data fetching and caching.
- **Engine Integration:** Camunda 7 REST API for real-time interaction.
- **BPMN Rendering:** `bpmn-js` for high-fidelity process visualization.

## 5. Visual Style (Aesthetic)
- **Primary Color:** Indigo-600 (Indigo)
- **Secondary Colors:** Emerald (Success), Rose (Failure/Warning), Slate (Neutral/Background)
- **Typography:** Sans-serif for UI, Monospace for IDs, variables, and logs.
- **Theme:** Dark sidebar with a light, clean workspace for maximum readability.
