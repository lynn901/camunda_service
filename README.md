# Camunda 7 中心化工作流服务 (Full-Stack)

基于 **Camunda 7.20** + **Spring Boot 3.1.5** + **React 19** 构建的中心化工作流引擎（Workflow Hub）。

## 项目结构 (Project Structure)

```text
camunda_service/
├── backend/                         # Camunda 引擎 (Spring Boot)
│   ├── src/                         # 后端源码
│   ├── pom.xml                      # Maven 配置
│   └── Dockerfile                   # 后端容器化配置
├── frontend/                        # 前端控制台 (React 19 + Vite)
│   ├── src/                         # 前端源码
│   ├── index.css                    # 基于 design.md 的 Vanilla CSS
│   └── Dockerfile                   # 前端容器化配置 (Nginx)
├── docker-compose.yml               # 全栈一键编排 (FE + BE + DB)
└── design.md                        # UI/UX 设计系统规范
```

---

## 快速启动 (Quick Start)

### 1. 环境准备
- Java 17+
- Node.js 20+
- Docker & Docker Compose

### 2. 一键启动（推荐）

```bash
# 复制并配置环境变量
cp .env.example .env

# 构建并启动所有服务 (PostgreSQL + Backend + Frontend)
docker-compose up -d --build
```

### 3. 本地开发模式

#### 后端 (Backend)
```bash
cd backend
mvn spring-boot:run
```
访问地址：`http://localhost:8080`

#### 前端 (Frontend)
```bash
cd frontend
npm install
npm run dev
```
访问地址：`http://localhost:5173`

---

## 核心技术栈 (Tech Stack)

### 后端 (Backend)
- **Engine**: Camunda 7.20
- **Framework**: Spring Boot 3.1.5
- **Database**: PostgreSQL
- **Patterns**: HTTP Webhook, External Task

### 前端 (Frontend)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS (Custom Design System)
- **Icons**: Lucide React
- **Process Visualization**: bpmn-js

---

## 安全与认证 (Security)

引擎已启用 **Basic Auth**。
- **默认账号**：`admin`
- **默认密码**：`admin` (可在 `.env` 中修改)

---

## API 参考

详见 `backend/src/main/java/com/example/workflow/controller/WorkflowController.java` 中的注释。
