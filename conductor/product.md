# Product Definition

## Overview
OpsFlowEngine is a modern, high-performance monitoring and intervention dashboard for Camunda 7.20. It serves as a centralized "Workflow Hub" for microservices, providing real-time visibility and management capabilities for complex business processes.

## Target Users
- **Operations Engineers:** Monitoring system health and intervening in failed process instances.
- **Developers:** Diagnosing workflow bugs and testing new BPMN models.
- **Business Analysts:** Auditing historical execution patterns and performance metrics.

## Key Goals
- **Real-time Visibility:** Instant access to the state of all running process instances.
- **Rapid Intervention:** Empower operators to resolve incidents with retry management, variable modification, and node jumping.
- **Centralized Management:** A single pane of glass for multi-version BPMN models, scheduled tasks, and external workers.
- **Auditability:** Maintain a clear, tamper-evident record of all human and system interventions.

## Core Features
- **Dashboard:** Real-time metrics on active instances, success rates, and failure alerts.
- **Intervention Center:** Detailed execution path visualization (bpmn-js), error diagnostics, and direct instance operations.
- **BPMN Library:** Deployment and version management for process definitions.
- **Execution History:** Read-only archive for post-mortem analysis and duration tracking.
- **Audit Logs:** Tamper-evident tracking of all human and system interventions (user operation logs).
- **Scheduled Tasks:** Automation of repetitive processes using Cron expressions.
- **External Worker Monitoring:** Health tracking and task lock management for distributed microservices.

## Success Metrics
- **Mean Time to Resolution (MTTR):** Reduction in the time taken to diagnose and fix failed process instances.
- **Operational Efficiency:** Fewer manual steps required to deploy models and manage schedules.
- **System Stability:** Improved visibility into worker health and task lock contention.
