package com.example.workflow.controller;

import com.example.workflow.dto.HistoricActivityInstanceDto;
import com.example.workflow.dto.HistoricProcessInstanceDto;
import com.example.workflow.service.WorkflowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    private static final Logger log = LoggerFactory.getLogger(WorkflowController.class);

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    // ─────────────────────────────────────────────────────────────
    // 流程实例
    // ─────────────────────────────────────────────────────────────

    /**
     * 发起流程实例。
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
     * 终止流程实例。
     */
    @DeleteMapping("/instance/{instanceId}")
    public ResponseEntity<Void> terminateInstance(
            @PathVariable String instanceId,
            @RequestParam(defaultValue = "REST_API_TERMINATE") String reason) {
        workflowService.deleteProcessInstance(instanceId, reason);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────
    // 任务操作
    // ─────────────────────────────────────────────────────────────

    /**
     * 完成人工任务。
     */
    @PostMapping("/task/{taskId}/complete")
    public ResponseEntity<Void> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) Map<String, Object> variables) {
        workflowService.completeTask(taskId, variables);
        return ResponseEntity.ok().build();
    }

    /**
     * 查询实例当前的待办任务。
     */
    @GetMapping("/task/by-instance/{instanceId}")
    public ResponseEntity<List<Map<String, Object>>> getTasks(@PathVariable String instanceId) {
        List<Map<String, Object>> tasks = workflowService.getTasksByInstanceId(instanceId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * 按 businessKey 查询待办任务。
     */
    @GetMapping("/task/by-business")
    public ResponseEntity<List<Map<String, Object>>> getTasksByBusiness(@RequestParam String businessKey) {
        List<Map<String, Object>> tasks = workflowService.getTasksByBusinessKey(businessKey);
        return ResponseEntity.ok(tasks);
    }

    // ─────────────────────────────────────────────────────────────
    // 变量与消息
    // ─────────────────────────────────────────────────────────────

    /**
     * 获取实例变量。
     */
    @GetMapping("/instance/{instanceId}/variables")
    public ResponseEntity<Map<String, Object>> getVariables(@PathVariable String instanceId) {
        Map<String, Object> vars = workflowService.getVariables(instanceId);
        return ResponseEntity.ok(vars);
    }

    /**
     * 设置/更新实例变量。
     */
    @PutMapping("/instance/{instanceId}/variables")
    public ResponseEntity<Void> setVariables(
            @PathVariable String instanceId,
            @RequestBody Map<String, Object> variables) {
        workflowService.setVariables(instanceId, variables);
        return ResponseEntity.ok().build();
    }

    /**
     * 向实例发送消息。
     */
    @PostMapping("/instance/{instanceId}/message")
    public ResponseEntity<Void> sendMessage(
            @RequestParam String messageName,
            @RequestParam String businessKey,
            @RequestBody(required = false) Map<String, Object> variables) {
        workflowService.sendMessage(messageName, businessKey, variables);
        return ResponseEntity.ok().build();
    }

    /**
     * 广播信号。
     */
    @PostMapping("/signal/{signalName}")
    public ResponseEntity<Void> sendSignal(
            @PathVariable String signalName,
            @RequestBody(required = false) Map<String, Object> variables) {
        workflowService.sendSignal(signalName, variables);
        return ResponseEntity.ok().build();
    }

    // ─────────────────────────────────────────────────────────────
    // 历史与定义
    // ─────────────────────────────────────────────────────────────

    /**
     * 查询历史流程实例（按 businessKey）。
     * 
     * @deprecated 请优先使用 {@link #getHistoryInstances(String)} 获取 DTO 列表。
     */
    @Deprecated
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@RequestParam String businessKey) {
        List<Map<String, Object>> history = workflowService.getHistoricInstances(businessKey);
        return ResponseEntity.ok(history);
    }

    /**
     * 查询历史流程实例（DTO 列表）。
     * 
     * @param businessKey 业务主键
     * @return 历史实例 DTO 列表
     */
    @GetMapping("/history/instances")
    public ResponseEntity<List<HistoricProcessInstanceDto>> getHistoryInstances(
            @RequestParam(required = false) String businessKey) {
        List<HistoricProcessInstanceDto> history = workflowService.getHistoricInstancesDto(businessKey);
        return ResponseEntity.ok(history);
    }

    /**
     * 查询历史活动实例（用于可视化路径）。
     * 
     * @param instanceId 流程实例 ID
     * @return 历史活动 DTO 列表
     */
    @GetMapping("/history/instances/{instanceId}/activities")
    public ResponseEntity<List<HistoricActivityInstanceDto>> getHistoryActivities(
            @PathVariable String instanceId) {
        List<HistoricActivityInstanceDto> activities = workflowService.getHistoricActivitiesDto(instanceId);
        return ResponseEntity.ok(activities);
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
