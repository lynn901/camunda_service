package com.example.workflow.service;

import com.example.workflow.dto.HistoricActivityInstanceDto;
import com.example.workflow.dto.HistoricProcessInstanceDto;
import com.example.workflow.dto.MetricsDto;
import io.micrometer.core.instrument.MeterRegistry;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.ManagementService;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.history.HistoricActivityInstance;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.history.HistoricProcessInstanceQuery;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.Incident;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
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
@Service
public class WorkflowService {

    private static final Logger log = LoggerFactory.getLogger(WorkflowService.class);

    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final HistoryService historyService;
    private final RepositoryService repositoryService;
    private final ManagementService managementService;
    private final MeterRegistry meterRegistry;

    public WorkflowService(RuntimeService runtimeService, 
                          TaskService taskService, 
                          HistoryService historyService, 
                          RepositoryService repositoryService,
                          ManagementService managementService,
                          MeterRegistry meterRegistry) {
        this.runtimeService = runtimeService;
        this.taskService = taskService;
        this.historyService = historyService;
        this.repositoryService = repositoryService;
        this.managementService = managementService;
        this.meterRegistry = meterRegistry;
    }

    // ─────────────────────────────────────────────────────────────
    // 指标统计 (Overall Overview)
    // ─────────────────────────────────────────────────────────────

    /**
     * 获取全站概览指标。
     */
    public MetricsDto getOverallMetrics() {
        MetricsDto dto = new MetricsDto();

        // 1. Process Stats
        MetricsDto.ProcessStats processStats = new MetricsDto.ProcessStats();
        processStats.setTotalInstances(historyService.createHistoricProcessInstanceQuery().count());
        processStats.setRunningInstances(runtimeService.createProcessInstanceQuery().count());
        processStats.setCompletedInstances(historyService.createHistoricProcessInstanceQuery().finished().count());
        processStats.setSuspendedInstances(runtimeService.createProcessInstanceQuery().suspended().count());
        dto.setProcessStats(processStats);

        // 2. Task Metrics
        MetricsDto.TaskMetrics taskMetrics = new MetricsDto.TaskMetrics();
        taskMetrics.setTaskBacklogs(taskService.createTaskQuery().count());
        
        // 简单计算平均耗时（此处仅为示例，大型生产环境建议使用专门的分析表或 Prometheus）
        List<HistoricProcessInstance> finished = historyService.createHistoricProcessInstanceQuery()
                .finished()
                .listPage(0, 100); // 采样最近 100 条
        double avgTime = finished.stream()
                .mapToLong(HistoricProcessInstance::getDurationInMillis)
                .average()
                .orElse(0.0);
        taskMetrics.setAvgCompletionTime(avgTime);
        
        long total = processStats.getTotalInstances();
        long incidents = runtimeService.createIncidentQuery().count();
        taskMetrics.setFailureRate(total > 0 ? (double) incidents / total : 0.0);
        dto.setTaskMetrics(taskMetrics);

        // 3. System Health (基于 Micrometer 和 JVM MXBean)
        MetricsDto.SystemHealth systemHealth = new MetricsDto.SystemHealth();
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        // TODO: For more robust cross-platform CPU monitoring, consider Micrometer's system.cpu.usage
        systemHealth.setCpuUsage(osBean.getSystemLoadAverage()); // 注意：Windows 下可能返回 -1
        
        Runtime runtime = Runtime.getRuntime();
        systemHealth.setMemoryUsage((runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024)); // MB
        
        // 获取数据库连接数（如果能从 MeterRegistry 获取）
        double activeConns = meterRegistry.find("jdbc.connections.active").gauge() != null ?
                meterRegistry.find("jdbc.connections.active").gauge().value() : 0.0;
        systemHealth.setDbConnections((long) activeConns);
        dto.setSystemHealth(systemHealth);

        return dto;
    }

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
        log.info("[WorkflowService] 流程已终止 | instanceId={} | reason={}", processInstanceId, reason);
    }

    // ─────────────────────────────────────────────────────────────
    // 任务操作
    // ─────────────────────────────────────────────────────────────

    /**
     * 完成一个人工任务。
     *
     * @param taskId    Camunda 内部任务 ID
     * @param variables 完成任务时设置的流程变量（可选）
     */
    public void completeTask(String taskId, Map<String, Object> variables) {
        taskService.complete(taskId, variables);
        log.info("[WorkflowService] 任务已完成 | taskId={}", taskId);
    }

    /**
     * 获取指定实例的所有待办任务。
     *
     * @param processInstanceId 实例 ID
     * @return 任务列表
     */
    public List<Map<String, Object>> getTasksByInstanceId(String processInstanceId) {
        List<Task> tasks = taskService.createTaskQuery().processInstanceId(processInstanceId).list();
        return tasks.stream()
                .map(t -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", t.getId());
                    dto.put("name", t.getName());
                    dto.put("assignee", t.getAssignee());
                    dto.put("createTime", t.getCreateTime());
                    dto.put("taskDefinitionKey", t.getTaskDefinitionKey());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 按业务主键获取待办任务（常用于业务系统查询单据当前状态）。
     *
     * @param businessKey 业务单号
     * @return 任务列表
     */
    public List<Map<String, Object>> getTasksByBusinessKey(String businessKey) {
        List<Task> tasks = taskService.createTaskQuery().processInstanceBusinessKey(businessKey).list();
        return tasks.stream()
                .map(t -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", t.getId());
                    dto.put("name", t.getName());
                    dto.put("processInstanceId", t.getProcessInstanceId());
                    dto.put("createTime", t.getCreateTime());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // 流程变量与消息
    // ─────────────────────────────────────────────────────────────

    /**
     * 获取流程实例的所有变量。
     */
    public Map<String, Object> getVariables(String processInstanceId) {
        return runtimeService.getVariables(processInstanceId);
    }

    /**
     * 设置流程变量（覆盖或新增）。
     */
    public void setVariables(String processInstanceId, Map<String, Object> variables) {
        runtimeService.setVariables(processInstanceId, variables);
        log.info("[WorkflowService] 变量已更新 | instanceId={} | count={}",
                processInstanceId, (variables != null ? variables.size() : 0));
    }

    /**
     * 向正在运行的实例发送消息。
     *
     * @param messageName 消息名
     * @param businessKey 业务主键（定位实例）
     * @param variables   随消息传递的变量
     */
    public void sendMessage(String messageName, String businessKey, Map<String, Object> variables) {
        runtimeService.createMessageCorrelation(messageName)
                .processInstanceBusinessKey(businessKey)
                .setVariables(variables)
                .correlate();
        log.info("[WorkflowService] 消息已发送 | message={} | businessKey={}", messageName, businessKey);
    }

    /**
     * 发送广播信号。
     */
    public void sendSignal(String signalName, Map<String, Object> variables) {
        runtimeService.signalEventReceived(signalName, variables);
        log.info("[WorkflowService] 信号已广播 | signal={}", signalName);
    }

    // ─────────────────────────────────────────────────────────────
    // 历史查询
    // ─────────────────────────────────────────────────────────────

    /**
     * 按 businessKey 查询历史实例记录。
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

    /**
     * 查询历史流程实例（DTO 版本）。
     *
     * @param businessKey 业务主键
     * @return 历史实例 DTO 列表
     */
    public List<HistoricProcessInstanceDto> getHistoricInstancesDto(String businessKey) {
        HistoricProcessInstanceQuery query = historyService.createHistoricProcessInstanceQuery();
        if (businessKey != null && !businessKey.isEmpty()) {
            query.processInstanceBusinessKey(businessKey);
        }
        List<HistoricProcessInstance> list = query.orderByProcessInstanceEndTime().desc().list();
        return list.stream()
                .map(h -> HistoricProcessInstanceDto.builder()
                        .instanceId(h.getId())
                        .processDefinitionKey(h.getProcessDefinitionKey())
                        .businessKey(h.getBusinessKey())
                        .startTime(h.getStartTime())
                        .endTime(h.getEndTime())
                        .state(h.getState())
                        .durationInMillis(h.getDurationInMillis())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 查询历史活动实例（用于可视化路径）。
     *
     * @param processInstanceId 流程实例 ID
     * @return 历史活动 DTO 列表
     */
    public List<HistoricActivityInstanceDto> getHistoricActivitiesDto(String processInstanceId) {
        List<HistoricActivityInstance> list = historyService.createHistoricActivityInstanceQuery()
                .processInstanceId(processInstanceId)
                .orderByHistoricActivityInstanceStartTime().asc()
                .list();
        return list.stream()
                .map(a -> HistoricActivityInstanceDto.builder()
                        .activityId(a.getActivityId())
                        .activityName(a.getActivityName())
                        .activityType(a.getActivityType())
                        .startTime(a.getStartTime())
                        .endTime(a.getEndTime())
                        .durationInMillis(a.getDurationInMillis())
                        .build())
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

    // ─────────────────────────────────────────────────────────────
    // 流程定义与部署
    // ─────────────────────────────────────────────────────────────

    /**
     * 部署 BPMN 流程定义。
     *
     * @param resourceName 资源名称（如 order-process.bpmn）
     * @param inputStream  BPMN 文件流
     * @return 部署 ID
     */
    public String deploy(String resourceName, InputStream inputStream) {
        Deployment deployment = repositoryService.createDeployment()
                .addInputStream(resourceName, inputStream)
                .name("Manual Deployment: " + resourceName)
                .deploy();
        log.info("[WorkflowService] 流程部署成功 | id={} | name={}", deployment.getId(), resourceName);
        return deployment.getId();
    }

    /**
     * 挂起流程定义（禁止发起新实例）。
     */
    public void suspendProcessDefinition(String processDefinitionKey) {
        repositoryService.suspendProcessDefinitionByKey(processDefinitionKey, true, null);
        log.info("[WorkflowService] 流程定义已挂起 | key={}", processDefinitionKey);
    }

    /**
     * 激活流程定义。
     */
    public void activateProcessDefinition(String processDefinitionKey) {
        repositoryService.activateProcessDefinitionByKey(processDefinitionKey, true, null);
        log.info("[WorkflowService] 流程定义已激活 | key={}", processDefinitionKey);
    }

    /**
     * 删除部署。
     *
     * @param deploymentId 部署 ID
     * @param cascade      是否级联删除（同时删除运行中实例）
     */
    public void deleteDeployment(String deploymentId, boolean cascade) {
        repositoryService.deleteDeployment(deploymentId, cascade);
        log.info("[WorkflowService] 部署已删除 | id={} | cascade={}", deploymentId, cascade);
    }

    // ─────────────────────────────────────────────────────────────
    // 故障干预 (Intervention)
    // ─────────────────────────────────────────────────────────────

    /**
     * 查询实例的故障列表 (Incidents)。
     */
    public List<Map<String, Object>> getIncidents(String processInstanceId) {
        List<Incident> incidents = runtimeService.createIncidentQuery()
                .processInstanceId(processInstanceId)
                .list();
        return incidents.stream()
                .map(i -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", i.getId());
                    dto.put("incidentType", i.getIncidentType());
                    dto.put("incidentMessage", i.getIncidentMessage());
                    dto.put("activityId", i.getActivityId());
                    dto.put("executionId", i.getExecutionId());
                    dto.put("jobId", i.getConfiguration()); // Configuration typically holds the jobId for failed jobs
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 重置 Job 重试次数（用于从故障中恢复）。
     *
     * @param jobId   Job ID
     * @param retries 重试次数 (通常设为 1)
     */
    public void setJobRetries(String jobId, int retries) {
        managementService.setJobRetries(jobId, retries);
        log.info("[WorkflowService] Job 重试次数已重置 | jobId={} | retries={}", jobId, retries);
    }

    /**
     * 流程实例修改 (Node Jumping / Modification)。
     * <p>
     * 这是一个简化版实现，直接取消当前节点并启动目标节点。
     *
     * @param processInstanceId    实例 ID
     * @param cancelActivityId     要取消的当前节点 ID
     * @param startBeforeActivityId 要跳转到的目标节点 ID
     */
    public void modifyProcessInstance(String processInstanceId, String cancelActivityId, String startBeforeActivityId) {
        runtimeService.createProcessInstanceModification(processInstanceId)
                .cancelAllForActivity(cancelActivityId)
                .startBeforeActivity(startBeforeActivityId)
                .execute();
        log.info("[WorkflowService] 实例节点跳转成功 | instanceId={} | cancel={} | jumpTo={}",
                processInstanceId, cancelActivityId, startBeforeActivityId);
    }
}
