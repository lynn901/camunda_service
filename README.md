# Camunda 7 中心化工作流服务

基于 **Camunda 7.20** + **Spring Boot 2.7.x** 构建的中心化工作流引擎（Workflow Hub）。

引擎仅负责**流程状态维护和路由**，业务逻辑通过两种模式委托给业务子系统执行：

| 模式 | 说明 | 适合场景 |
|------|------|----------|
| 模式一：HTTP 回调 (Webhook) | 引擎主动 POST 调用业务接口 | 调用方无法引入 Camunda SDK |
| 模式二：外部任务 (External Task) | 业务服务轮询拉取任务（官方推荐） | 微服务架构，解耦强，可靠性高 |

---

## 项目结构

```
camunda_service/
├── src/main/java/com/example/workflow/
│   ├── CamundaWorkflowApplication.java   # 入口（@EnableProcessApplication）
│   ├── config/
│   │   └── AppConfig.java               # RestTemplate Bean
│   ├── delegate/
│   │   └── HttpCallbackDelegate.java    # 通用 HTTP 回调委托（模式一）
│   ├── service/
│   │   └── WorkflowService.java         # 引擎操作封装（启动/完成/查询等）
│   ├── controller/
│   │   └── WorkflowController.java      # REST API（对业务线开放）
│   └── worker/
│       └── OrderProcessWorker.java      # 外部任务 Worker 参考示例（模式二）
├── src/main/resources/
│   ├── application.yml                  # 应用配置（支持环境变量覆盖）
│   └── processes/
│       └── order-process.bpmn           # 演示流程（含两种任务模式 + 网关）
├── Dockerfile                           # 多阶段构建（构建 + 运行分离）
├── docker-compose.yml                   # PostgreSQL + 工作流引擎编排
├── .env.example                         # 环境变量模板
└── pom.xml                              # Maven 依赖（Camunda 7.20 BOM）
```

---

## 快速启动

### 1. 配置环境变量

```bash
cp .env.example .env
# 根据实际情况编辑 .env（数据库密码、管理员账号等）
```

### 2. 一键启动（Docker Compose）

```bash
# 打包应用（跳过测试）
mvn clean package -DskipTests

# 构建镜像并启动所有服务（PostgreSQL + 工作流引擎）
docker-compose up -d --build
```

### 3. 验证服务

```bash
# 查看引擎日志
docker-compose logs -f camunda-workflow

# 健康检查（应返回 "status":"UP"）
curl http://localhost:8080/actuator/health
```

**Cockpit 控制台：** http://localhost:8080/camunda/app/cockpit/default/
> 账号/密码：`admin / admin`（可在 `.env` 中修改）

---

## REST API 快速参考

> 基础路径：`http://localhost:8080/api/workflow`

### 发起流程

```bash
curl -X POST "http://localhost:8080/api/workflow/start/order-process?businessKey=ORD-001" \
  -H "Content-Type: application/json" \
  -d '{
    "callbackUrl": "http://your-service/api/callback",
    "orderId": "ORD-001",
    "reviewer": "zhangsan"
  }'
```

### 完成人工任务

```bash
# 先查询当前任务
curl "http://localhost:8080/api/workflow/task/by-business?processKey=order-process&businessKey=ORD-001"

# 完成任务（审批通过）
curl -X POST "http://localhost:8080/api/workflow/task/{taskId}/complete" \
  -H "Content-Type: application/json" \
  -d '{"approved": true, "comment": "同意"}'
```

### 发送消息（回调确认）

```bash
curl -X POST "http://localhost:8080/api/workflow/instance/{instanceId}/message?messageName=OrderConfirmed" \
  -H "Content-Type: application/json" \
  -d '{"result": "SUCCESS"}'
```

---

## 外部任务 (External Task) 模式详解

### 1. 核心原理

External Task 遵循 **“拉取 (Pull)”** 而非 “推送 (Push)” 的设计哲学，是微服务架构下处理长耗时、高并发任务的最佳实践。

*   **解耦：** 流程引擎不需要知道业务系统的具体地址或协议（如 REST/gRPC），只需维护任务队列。
*   **Topic 机制：** 在 BPMN 中定义任务所属的 `Topic`。业务系统（Worker）订阅该 Topic。
*   **获取与锁定 (Fetch & Lock)：** Worker 主动轮询引擎获取任务并将其锁定。在锁定期内，其他 Worker 无法处理该任务，保证了分布式环境下的原子性。
*   **状态反馈：** Worker 执行完逻辑后，向引擎发送 `complete`（成功）、`handleFailure`（重试）或 `handleBpmnError`（业务异常）指令。

### 2. 详细使用步骤

#### 第一步：BPMN 配置
1. 在 Camunda Modeler 中选中 **Service Task**。
2. 在属性面板的 **Implementation** 中选择 `External`。
3. 在 **Topic** 栏填写唯一标识，例如 `inventory-check`。

#### 第二步：引入依赖（业务子系统）
在 Spring Boot 项目中添加官方 SDK：
```xml
<dependency>
    <groupId>org.camunda.bpm</groupId>
    <artifactId>camunda-external-task-client-spring-boot</artifactId>
    <version>7.20.0</version>
</dependency>
```

#### 第三步：客户端配置
在 `application.yml` 中指定工作流引擎的 REST 入口：
```yaml
camunda.bpm.client:
  base-url: http://camunda-workflow:8080/engine-rest  # 引擎地址
  async-response-timeout: 20000                      # 长轮询超时时间
  worker-id: inventory-service-01                    # Worker 身份标识
  subscriptions:
    inventory-check:                                 # Topic 名称
      variable-names: [orderId, count]               # 仅获取需要的变量（减少流量）
      lock-duration: 30000                           # 锁定时间（毫秒）
```

#### 第四步：编写业务逻辑 (Worker)
```java
@Configuration
@ExternalTaskSubscription("inventory-check") // 订阅 Topic
public class InventoryWorker implements ExternalTaskHandler {

    @Override
    public void execute(ExternalTask task, ExternalTaskService service) {
        String orderId = task.getVariable("orderId");
        
        try {
            // 执行业务逻辑...
            boolean success = true; 
            
            if (success) {
                // 1. 成功：提交变量到引擎并完成
                Map<String, Object> variables = Collections.singletonMap("stockStatus", "INSTOCK");
                service.complete(task, variables);
            } else {
                // 2. 业务异常：抛出 BPMN Error，由流程图中的 Error Boundary 捕获
                service.handleBpmnError(task, "OUT_OF_STOCK", "库存不足");
            }
        } catch (Exception e) {
            // 3. 技术异常：触发重试机制（重试3次，间隔10秒）
            service.handleFailure(task, "Connection Error", e.getMessage(), 3, 10000);
        }
    }
}
```

---

## 原生 Camunda REST API

引擎在 `/engine-rest/**` 暴露了完整的原生 API（近百个接口），可直接调用：

- 流程定义：`GET /engine-rest/process-definition`
- 流程实例：`GET /engine-rest/process-instance`
- 外部任务：`POST /engine-rest/external-task/fetchAndLock`
- 历史数据：`GET /engine-rest/history/process-instance`

详见官方文档：https://docs.camunda.org/manual/7.20/reference/rest/

---

## 生产环境注意事项

1. **幂等性** — 无论 Webhook 还是 External Task，业务接口必须幂等（引擎重试时可能重复调用）。
2. **异步保护** — 使用 Webhook 模式的 Service Task 必须勾选 `Asynchronous Before`，避免 HTTP 超时拖垮主事务。
3. **密码安全** — 生产环境请使用 Kubernetes Secret 或 Vault 管理敏感配置，不要明文写入镜像。
4. **历史级别** — `history-level: audit` 适合生产。`full` 会记录所有变量变更，DB 增长极快。
5. **连接池** — HikariCP 的 `maximum-pool-size` 应与 Job Executor 的 `max-pool-size` 配合调优。
