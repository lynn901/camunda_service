package com.example.workflow.worker;

/**
 * 【参考模板】外部任务 Worker — 订单处理（模式二：External Task）。
 *
 * <p><b>重要：</b>此类仅作为接入规范的代码参考，<b>不属于工作流中心服务本身</b>。
 * 请将此文件复制到对应的业务子服务工程中使用（并引入 External Task Client SDK）。
 *
 * <h2>业务子服务接入步骤</h2>
 * <ol>
 *   <li>在业务子服务的 pom.xml 中引入 External Task 客户端 SDK：
 *   <pre>{@code
 *   <dependency>
 *       <groupId>org.camunda.bpm</groupId>
 *       <artifactId>camunda-external-task-client-spring-boot</artifactId>
 *       <version>7.20.0</version>
 *   </dependency>
 *   }</pre>
 *   </li>
 *   <li>在 application.yml 中配置工作流服务地址：
 *   <pre>{@code
 *   camunda:
 *     bpm:
 *       client:
 *         base-url: http://camunda-workflow-server:8080/engine-rest
 *         async-response-timeout: 10000
 *   }</pre>
 *   </li>
 *   <li>参考下方代码示例，在业务子服务中编写并注册 Worker Bean。</li>
 * </ol>
 *
 * <h2>对应 BPMN 配置</h2>
 * 在 BPMN 流程图中，将 Service Task 的 Implementation 设为 {@code External}，
 * Topic Name 填写 {@code process-order}（与 @ExternalTaskSubscription 中的值一致）。
 *
 * <h2>完整代码示例（复制到业务子服务中使用）</h2>
 * <pre>{@code
 * import lombok.extern.slf4j.Slf4j;
 * import org.camunda.bpm.client.spring.annotation.ExternalTaskSubscription;
 * import org.camunda.bpm.client.task.ExternalTask;
 * import org.camunda.bpm.client.task.ExternalTaskHandler;
 * import org.camunda.bpm.client.task.ExternalTaskService;
 * import org.springframework.context.annotation.Configuration;
 * import java.util.HashMap;
 * import java.util.Map;
 *
 * @Slf4j
 * @Configuration
 * @ExternalTaskSubscription("process-order")   // 订阅 BPMN 中配置的 Topic
 * public class OrderProcessWorker implements ExternalTaskHandler {
 *
 *     @Override
 *     public void execute(ExternalTask externalTask, ExternalTaskService externalTaskService) {
 *         String businessKey = externalTask.getBusinessKey();
 *         String processInstanceId = externalTask.getProcessInstanceId();
 *         log.info("[Worker] 收到外部任务 | businessKey={} | processInstanceId={}", businessKey, processInstanceId);
 *
 *         try {
 *             // 1. 获取工作流传递的参数
 *             String orderId = (String) externalTask.getVariable("orderId");
 *
 *             // 2. 执行实际业务逻辑（调用库存服务、扣款、发消息等）
 *             // ...
 *
 *             // 3. 成功：通知引擎任务完成，并可传回结果变量
 *             Map<String, Object> result = new HashMap<>();
 *             result.put("orderProcessed", true);
 *             result.put("trackingNumber", "TRK-" + System.currentTimeMillis());
 *             externalTaskService.complete(externalTask, result);
 *             log.info("[Worker] 任务完成 | businessKey={}", businessKey);
 *
 *         } catch (Exception e) {
 *             log.error("[Worker] 任务失败 | businessKey={} | error={}", businessKey, e.getMessage(), e);
 *
 *             // 4a. 触发重试（retries 减至 0 后，Camunda 创建 Incident）
 *             externalTaskService.handleFailure(externalTask,
 *                 "业务处理失败", e.getMessage(), 3, 10_000L);
 *
 *             // 4b. 或触发 BPMN Error 事件边界（推荐用于已知业务异常）：
 *             // externalTaskService.handleBpmnError(externalTask, "ORDER_PROCESS_ERROR", e.getMessage());
 *         }
 *     }
 * }
 * }</pre>
 */
public final class OrderProcessWorker {
    // 此类仅包含 Javadoc 参考文档，无运行时逻辑。
    // 实际 Worker 代码请在业务子服务中实现（参见上方代码示例）。
    private OrderProcessWorker() {}
}
