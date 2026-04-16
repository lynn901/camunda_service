package com.example.workflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 工作流核心服务封装。
 *
 * <p>
 * 对内统一提供流程启动、任务操作、变量查询、消息/信号触发等能力；
 * 对外由 {@code WorkflowController} 通过 REST API 暴露给各业务线。
 *
 * <p>
 * <b>设计原则：</b>此 Service 仅做引擎操作，不含任何业务逻辑。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final HistoryService historyService;
    private final RepositoryService repositoryService;

    // ─────────────────────────────────────────────────────────────
    // 流程实例管理
    // ─────────────────────────────────────────────────────────────

    /**
     * 按流程定义 Key 启动新实例。
     *
     * @param processDefinitionKey BPMN 文件中 &lt;process id="..."&gt; 的值
     * @param businessKey          业务主键（如订单号），可用于关联查询，建议全局唯一
     * @param variables            初始流程变量（包括 callbackUrl 等通用参数）
     * @return 新创建的流程实例 ID
     */
    public String startProcess(String processDefinitionKey,
            String businessKey,
            Map<String, Object> variables) {
        Map<String, Object> vars = variables != null ? variables : new HashMap<>();
        ProcessInstance instance = runtimeService.startProcessInstanceByKey(
                processDefinitionKey, businessKey, vars);
        log.info("[WorkflowService] 流程已启动 | key={} | businessKey={} | instanceId={}",
                processDefinitionKey, businessKey, instance.getId());
        return instance.getId();
    }

    /**
     * 通过消息事件启动流程（适合事件驱动架构）。
     *
     * @param messageName 消息名称（与 BPMN Start Event 中的 Message Name 对应）
     * @param businessKey 业务主键
     * @param variables   初始变量
     * @return 流程实例 ID
     */
    public String startProcessByMessage(String messageName,
            String businessKey,
            Map<String, Object> variables) {
        ProcessInstance instance = runtimeService.startProcessInstanceByMessage(
                messageName, businessKey, variables);
        log.info("[WorkflowService] 通过消息启动流程 | message={} | businessKey={} | instanceId={}",
                messageName, businessKey, instance.getId());
        return instance.getId();
    }

    /**
     * 终止并删除流程实例（谨慎使用）。
     *
     * @param processInstanceId 实例 ID
     * @param reason            删除原因（记录到历史）
     */
    public void deleteProcessInstance(String processInstanceId, String reason) {
        runtimeService.deleteProcessInstance(processInstanceId, reason);
        log.warn("[WorkflowService] 流程实例已删除 | instanceId={} | reason={}", processInstanceId, reason);
    }

    // ─────────────────────────────────────────────────────────────
    // 人工任务（User Task）操作
    // ─────────────────────────────────────────────────────────────

    /**
     * 完成人工任务。
     *
     * @param taskId    任务 ID（通过查询获取）
     * @param variables 任务完成时携带的输出变量（如审批结果）
     */
    public void completeTask(String taskId, Map<String, Object> variables) {
        taskService.complete(taskId, variables);
        log.info("[WorkflowService] 任务已完成 | taskId={}", taskId);
    }

    /**
     * 查询指定流程实例的当前待办任务。
     *
     * @param processInstanceId 流程实例 ID
     * @return 任务列表（含任务 ID、名称、受理人等）
     */
    public List<Map<String, Object>> getTasksByProcessInstance(String processInstanceId) {
        List<Task> tasks = taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .list();
        return tasks.stream()
                .map(t -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("taskId", t.getId());
                    dto.put("taskName", t.getName());
                    dto.put("assignee", t.getAssignee());
                    dto.put("created", t.getCreateTime());
                    dto.put("dueDate", t.getDueDate());
                    dto.put("processInstanceId", t.getProcessInstanceId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 按 businessKey 查询待办任务。
     *
     * @param processDefinitionKey 流程定义 Key
     * @param businessKey          业务主键
     * @return 任务列表
     */
    public List<Map<String, Object>> getTasksByBusinessKey(String processDefinitionKey,
            String businessKey) {
        List<Task> tasks = taskService.createTaskQuery()
                .processDefinitionKey(processDefinitionKey)
                .processInstanceBusinessKey(businessKey)
                .list();
        return tasks.stream()
                .map(t -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("taskId", t.getId());
                    dto.put("taskName", t.getName());
                    dto.put("assignee", t.getAssignee());
                    dto.put("created", t.getCreateTime());
                    dto.put("processInstanceId", t.getProcessInstanceId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // 流程变量操作
    // ─────────────────────────────────────────────────────────────

    /**
     * 获取流程实例的所有运行时变量。
     *
     * @param processInstanceId 实例 ID
     * @return 变量 Map
     */
    public Map<String, Object> getProcessVariables(String processInstanceId) {
        return runtimeService.getVariables(processInstanceId);
    }

    /**
     * 设置单个流程变量。
     *
     * @param processInstanceId 实例 ID
     * @param variableName      变量名
     * @param value             变量值
     */
    public void setProcessVariable(String processInstanceId, String variableName, Object value) {
        runtimeService.setVariable(processInstanceId, variableName, value);
        log.debug("[WorkflowService] 设置流程变量 | instanceId={} | {}={}", processInstanceId, variableName, value);
    }

    // ─────────────────────────────────────────────────────────────
    // 消息 / 信号
    // ─────────────────────────────────────────────────────────────

    /**
     * 向指定流程实例发送消息（用于触发中间捕获消息事件，如回调确认）。
     *
     * @param processInstanceId 实例 ID
     * @param messageName       消息名称
     * @param variables         消息携带的变量
     */
    public void sendMessage(String processInstanceId, String messageName, Map<String, Object> variables) {
        runtimeService.createMessageCorrelation(messageName)
                .processInstanceId(processInstanceId)
                .setVariables(variables)
                .correlate();
        log.info("[WorkflowService] 消息已发送 | instanceId={} | message={}", processInstanceId, messageName);
    }

    /**
     * 广播信号（触发所有订阅该信号的流程实例）。
     *
     * @param signalName 信号名称
     * @param variables  信号携带的变量
     */
    public void broadcastSignal(String signalName, Map<String, Object> variables) {
        runtimeService.signalEventReceived(signalName, variables);
        log.info("[WorkflowService] 信号已广播 | signal={}", signalName);
    }

    // ─────────────────────────────────────────────────────────────
    // 历史查询
    // ─────────────────────────────────────────────────────────────

    /**
     * 查询历史流程实例（已完成/终止的实例）。
     *
     * @param businessKey 业务主键
     * @return 历史实例信息
     */
    public List<Map<String, Object>> getHistoricInstances(String businessKey) {
        List<HistoricProcessInstance> list = historyService.createHistoricProcessInstanceQuery()
                .processInstanceBusinessKey(businessKey)
                .orderByProcessInstanceEndTime().desc()
                .list();
        return list.stream()
                .map(h -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("instanceId", h.getId());
                    dto.put("processDefinitionKey", h.getProcessDefinitionKey());
                    dto.put("businessKey", h.getBusinessKey());
                    dto.put("startTime", h.getStartTime());
                    dto.put("endTime", h.getEndTime());
                    dto.put("state", h.getState());
                    dto.put("durationInMillis", h.getDurationInMillis());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // 流程定义查询
    // ─────────────────────────────────────────────────────────────

    /**
     * 获取当前部署的所有流程定义（最新版本）。
     *
     * @return 流程定义列表
     */
    public List<Map<String, Object>> getDeployedProcessDefinitions() {
        List<ProcessDefinition> defs = repositoryService.createProcessDefinitionQuery()
                .latestVersion()
                .orderByProcessDefinitionKey().asc()
                .list();
        return defs.stream()
                .map(d -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", d.getId());
                    dto.put("key", d.getKey());
                    dto.put("name", d.getName());
                    dto.put("version", d.getVersion());
                    dto.put("deploymentId", d.getDeploymentId());
                    dto.put("resourceName", d.getResourceName());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
