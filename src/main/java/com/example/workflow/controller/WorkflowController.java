package com.example.workflow.controller;

import com.example.workflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 工作流 REST 控制器 — 对各业务线开放的精简 API。
 *
 * <p>
 * Camunda 在 {@code /engine-rest/**} 已暴露近百个原生 API，本 Controller 额外提供
 * 面向业务场景的、已做参数校验和异常封装的"精简版"接口，推荐各业务线优先对接本层。
 *
 * <h2>接口列表</h2>
 * <ul>
 * <li>POST /api/workflow/start/{processKey} — 发起流程</li>
 * <li>POST /api/workflow/start/message/{messageName} — 通过消息发起流程</li>
 * <li>DELETE /api/workflow/instance/{instanceId} — 终止流程实例</li>
 * <li>POST /api/workflow/task/{taskId}/complete — 完成人工任务</li>
 * <li>GET /api/workflow/task/by-instance/{instanceId} — 查询实例待办任务</li>
 * <li>GET /api/workflow/task/by-business — 按 businessKey 查任务</li>
 * <li>GET /api/workflow/instance/{instanceId}/variables — 获取流程变量</li>
 * <li>PUT /api/workflow/instance/{instanceId}/variables — 设置流程变量</li>
 * <li>POST /api/workflow/instance/{instanceId}/message — 发送消息</li>
 * <li>POST /api/workflow/signal/{signalName} — 广播信号</li>
 * <li>GET /api/workflow/history — 查询历史实例</li>
 * <li>GET /api/workflow/definitions — 查询已部署流程定义</li>
 * </ul>
 */
@Slf4j
@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    // ─────────────────────────────────────────────────────────────
    // 流程实例
    // ─────────────────────────────────────────────────────────────

    /**
     * 发起流程实例。
     *
     * <p>请求体示例：
     * <pre>{@code
     * {
     * "callbackUrl": "http://order-service/api/callback",
     * "orderId": "ORD-001",
     * "amount": 999.00
     * }
     * }</pre>
     *
     * @param processKey 流程定义 Key（BPMN 中的 process id）
     * @param businessKey 业务主键（建议使用业务单号）
     * @param variables 初始流程变量
     */
    @PostMapping("/start/{processKey}")
    public ResponseEntity<Map<String, Object>> startProcess(
            @PathVariable String processKey,
            @RequestParam String businessKey,
            @RequestBody(required = false) Map<String, Object> variables) {

        String instanceId = workflowService.startProcess(processKey, businessKey, variables);
        Map<String, Object> result = new HashMap<>();
        result.put("processInstanceId", instanceId);
        result.put("processDefinitionKey", processKey);
        result.put("businessKey", businessKey);
        result.put("status", "STARTED");
        return ResponseEntity.ok(result);
    }

    /**
     * 通过消息事件发起流程（事件驱动模式）。
     */
    @PostMapping("/start/message/{messageName}")
    public ResponseEntity<Map<String, Object>> startProcessByMessage(
            @PathVariable String messageName,
            @RequestParam String businessKey,
            @RequestBody(required = false) Map<String, Object> variables) {

        String instanceId = workflowService.startProcessByMessage(messageName, businessKey, variables);
        Map<String, Object> result = new HashMap<>();
        result.put("processInstanceId", instanceId);
        result.put("messageName", messageName);
        result.put("businessKey", businessKey);
        result.put("status", "STARTED");
        return ResponseEntity.ok(result);
    }

    /**
     * 终止并删除流程实例（管理接口，生产环境建议权限管控）。
     */
    @DeleteMapping("/instance/{instanceId}")
    public ResponseEntity<Map<String, Object>> deleteProcessInstance(
            @PathVariable String instanceId,
            @RequestParam(required = false, defaultValue = "手动终止") String reason) {

        workflowService.deleteProcessInstance(instanceId, reason);
        Map<String, Object> result = new HashMap<>();
        result.put("processInstanceId", instanceId);
        result.put("status", "DELETED");
        result.put("reason", reason);
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────
    // 人工任务
    // ─────────────────────────────────────────────────────────────

    /**
     * 完成人工任务（User Task）。
     *
     * <p>
     * 请求体示例（审批场景）：
     * 
     * <pre>{@code { "approved": true, "comment": "同意" }}</pre>
     */
    @PostMapping("/task/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) Map<String, Object> variables) {

        try {
            workflowService.completeTask(taskId, variables);
            Map<String, Object> result = new HashMap<>();
            result.put("taskId", taskId);
            result.put("status", "COMPLETED");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[WorkflowController] 完成任务失败 | taskId={} | error={}", taskId, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("taskId", taskId);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 查询指定流程实例的当前待办任务。
     */
    @GetMapping("/task/by-instance/{instanceId}")
    public ResponseEntity<List<Map<String, Object>>> getTasksByInstance(
            @PathVariable String instanceId) {

        List<Map<String, Object>> tasks = workflowService.getTasksByProcessInstance(instanceId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * 按流程定义 Key + 业务主键查询待办任务。
     *
     * @param processKey  流程定义 Key
     * @param businessKey 业务主键
     */
    @GetMapping("/task/by-business")
    public ResponseEntity<List<Map<String, Object>>> getTasksByBusiness(
            @RequestParam String processKey,
            @RequestParam String businessKey) {

        List<Map<String, Object>> tasks = workflowService.getTasksByBusinessKey(processKey, businessKey);
        return ResponseEntity.ok(tasks);
    }

    // ─────────────────────────────────────────────────────────────
    // 流程变量
    // ─────────────────────────────────────────────────────────────

    /**
     * 获取流程实例的运行时变量。
     */
    @GetMapping("/instance/{instanceId}/variables")
    public ResponseEntity<Map<String, Object>> getVariables(@PathVariable String instanceId) {
        Map<String, Object> variables = workflowService.getProcessVariables(instanceId);
        return ResponseEntity.ok(variables);
    }

    /**
     * 设置单个流程变量。
     *
     * <p>
     * 请求体：{@code { "variableName": "xxx", "value": "yyy" }}
     */
    @PutMapping("/instance/{instanceId}/variables")
    public ResponseEntity<Map<String, Object>> setVariable(
            @PathVariable String instanceId,
            @RequestBody Map<String, Object> body) {

        String variableName = (String) body.get("variableName");
        Object value = body.get("value");
        workflowService.setProcessVariable(instanceId, variableName, value);
        Map<String, Object> result = new HashMap<>();
        result.put("instanceId", instanceId);
        result.put("variableName", variableName);
        result.put("status", "UPDATED");
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────
    // 消息 / 信号
    // ─────────────────────────────────────────────────────────────

    /**
     * 向流程实例发送消息（触发中间消息捕获事件）。
     *
     * <p>
     * 适合回调确认场景：业务系统处理完成后，主动回调工作流服务告知结果。
     */
    @PostMapping("/instance/{instanceId}/message")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable String instanceId,
            @RequestParam String messageName,
            @RequestBody(required = false) Map<String, Object> variables) {

        workflowService.sendMessage(instanceId, messageName, variables != null ? variables : new HashMap<>());
        Map<String, Object> result = new HashMap<>();
        result.put("instanceId", instanceId);
        result.put("messageName", messageName);
        result.put("status", "MESSAGE_SENT");
        return ResponseEntity.ok(result);
    }

    /**
     * 广播信号（触发全部订阅该信号的流程实例）。
     */
    @PostMapping("/signal/{signalName}")
    public ResponseEntity<Map<String, Object>> broadcastSignal(
            @PathVariable String signalName,
            @RequestBody(required = false) Map<String, Object> variables) {

        workflowService.broadcastSignal(signalName, variables != null ? variables : new HashMap<>());
        Map<String, Object> result = new HashMap<>();
        result.put("signalName", signalName);
        result.put("status", "SIGNAL_BROADCASTED");
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────
    // 查询
    // ─────────────────────────────────────────────────────────────

    /**
     * 查询历史流程实例（按 businessKey）。
     */
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@RequestParam String businessKey) {
        List<Map<String, Object>> history = workflowService.getHistoricInstances(businessKey);
        return ResponseEntity.ok(history);
    }

    /**
     * 获取当前部署的所有流程定义（最新版本）。
     */
    @GetMapping("/definitions")
    public ResponseEntity<List<Map<String, Object>>> getDefinitions() {
        List<Map<String, Object>> defs = workflowService.getDeployedProcessDefinitions();
        return ResponseEntity.ok(defs);
    }
}
