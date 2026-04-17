# Product Definition

## Project Goal
A centralized workflow engine (Workflow Hub) built on Camunda 7.20, designed to manage process states and route business logic across external microservices.

## Target Audience
- System Administrators and Process Owners monitoring workflows.
- Backend Engineers integrating microservices via HTTP Callbacks or External Tasks.

## Core Capabilities
- **BPMN 2.0 Engine:** Executes standards-compliant process models.
- **Microservices Orchestration:** Delegates tasks using webhooks and Camunda's external task pattern.
- **Real-time Monitoring:** React-based dashboard for viewing process execution, states, and variable management.
- **Secure Access:** Built-in Basic Auth against Camunda Identity Service.