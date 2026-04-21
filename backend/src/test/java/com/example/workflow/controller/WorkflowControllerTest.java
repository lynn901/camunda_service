package com.example.workflow.controller;

import com.example.workflow.dto.HistoricActivityInstanceDto;
import com.example.workflow.dto.HistoricProcessInstanceDto;
import com.example.workflow.dto.MetricsDto;
import com.example.workflow.service.WorkflowService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.spring.boot.starter.property.CamundaBpmProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WorkflowController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
class WorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WorkflowService workflowService;

    @MockBean
    private CamundaBpmProperties camundaBpmProperties;

    @MockBean
    private ProcessEngine processEngine;

    @Test
    void shouldStartProcess() throws Exception {
        // Given
        String processKey = "order-process";
        String businessKey = "BK-001";
        String instanceId = "inst-123";

        when(workflowService.startProcess(anyString(), anyString(), any())).thenReturn(instanceId);

        // When & Then
        mockMvc.perform(post("/api/workflow/start/" + processKey)
                .param("businessKey", businessKey)
                .content("{\"var1\": \"val1\"}")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processInstanceId").value(instanceId))
                .andExpect(jsonPath("$.processDefinitionKey").value(processKey))
                .andExpect(jsonPath("$.businessKey").value(businessKey))
                .andExpect(jsonPath("$.status").value("STARTED"));
    }

    @Test
    void shouldTerminateInstance() throws Exception {
        // Given
        String instanceId = "inst-123";

        // When & Then
        mockMvc.perform(delete("/api/workflow/instance/" + instanceId)
                .param("reason", "cancelled")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldCompleteTask() throws Exception {
        // Given
        String taskId = "task-456";

        // When & Then
        mockMvc.perform(post("/api/workflow/task/" + taskId + "/complete")
                .content("{\"approved\": true}")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetTasks() throws Exception {
        // Given
        String instanceId = "inst-123";
        Map<String, Object> task = new HashMap<>();
        task.put("id", "task-456");
        task.put("name", "Review Order");

        when(workflowService.getTasksByInstanceId(instanceId))
                .thenReturn(Collections.singletonList(task));

        // When & Then
        mockMvc.perform(get("/api/workflow/task/by-instance/" + instanceId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("task-456"))
                .andExpect(jsonPath("$[0].name").value("Review Order"));
    }

    @Test
    void shouldGetVariables() throws Exception {
        // Given
        String instanceId = "inst-123";
        Map<String, Object> variables = new HashMap<>();
        variables.put("var1", "val1");

        when(workflowService.getVariables(instanceId)).thenReturn(variables);

        // When & Then
        mockMvc.perform(get("/api/workflow/instance/" + instanceId + "/variables")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.var1").value("val1"));
    }

    @Test
    void shouldSetVariables() throws Exception {
        // Given
        String instanceId = "inst-123";

        // When & Then
        mockMvc.perform(put("/api/workflow/instance/" + instanceId + "/variables")
                .content("{\"var2\": \"val2\"}")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetDefinitions() throws Exception {
        // Given
        Map<String, Object> definition = new HashMap<>();
        definition.put("id", "def-123");
        definition.put("key", "order-process");

        when(workflowService.getDeployedProcessDefinitions())
                .thenReturn(Collections.singletonList(definition));

        // When & Then
        mockMvc.perform(get("/api/workflow/definitions")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("def-123"))
                .andExpect(jsonPath("$[0].key").value("order-process"));
    }

    @Test
    void shouldDeployBpmn() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile("file", "test.bpmn", "text/xml", "bpmn-content".getBytes());
        when(workflowService.deploy(anyString(), any())).thenReturn("deploy-123");

        // When & Then
        mockMvc.perform(multipart("/api/workflow/deploy").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deploymentId").value("deploy-123"))
                .andExpect(jsonPath("$.resourceName").value("test.bpmn"));
    }

    @Test
    void shouldGetIncidents() throws Exception {
        // Given
        String instanceId = "inst-123";
        Map<String, Object> incident = new HashMap<>();
        incident.put("id", "inc-1");
        incident.put("incidentType", "failedJob");

        when(workflowService.getIncidents(instanceId))
                .thenReturn(Collections.singletonList(incident));

        // When & Then
        mockMvc.perform(get("/api/workflow/instance/" + instanceId + "/incidents")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("inc-1"))
                .andExpect(jsonPath("$[0].incidentType").value("failedJob"));
    }

    @Test
    void shouldSetJobRetries() throws Exception {
        // Given
        String jobId = "job-123";

        // When & Then
        mockMvc.perform(post("/api/workflow/jobs/" + jobId + "/retries")
                .param("retries", "3")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetHistoryInstances() throws Exception {
        // Given
        HistoricProcessInstanceDto dto = HistoricProcessInstanceDto.builder()
                .instanceId("inst-123")
                .businessKey("BK-123")
                .state("COMPLETED")
                .startTime(new Date())
                .build();

        when(workflowService.getHistoricInstancesDto(anyString()))
                .thenReturn(Collections.singletonList(dto));

        // When & Then
        mockMvc.perform(get("/api/workflow/history/instances")
                .param("businessKey", "BK-123")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].instanceId").value("inst-123"))
                .andExpect(jsonPath("$[0].businessKey").value("BK-123"))
                .andExpect(jsonPath("$[0].state").value("COMPLETED"));
    }

    @Test
    void shouldGetHistoryActivities() throws Exception {
        // Given
        HistoricActivityInstanceDto dto = HistoricActivityInstanceDto.builder()
                .activityId("act-1")
                .activityName("Task 1")
                .activityType("userTask")
                .startTime(new Date())
                .build();

        when(workflowService.getHistoricActivitiesDto(anyString()))
                .thenReturn(Collections.singletonList(dto));

        // When & Then
        mockMvc.perform(get("/api/workflow/history/instances/inst-123/activities")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].activityId").value("act-1"))
                .andExpect(jsonPath("$[0].activityName").value("Task 1"))
                .andExpect(jsonPath("$[0].activityType").value("userTask"));
    }

    @Test
    void shouldGetOverallMetrics() throws Exception {
        // Given
        MetricsDto metrics = new MetricsDto();
        MetricsDto.ProcessStats stats = new MetricsDto.ProcessStats();
        stats.setTotalInstances(100L);
        metrics.setProcessStats(stats);

        when(workflowService.getOverallMetrics()).thenReturn(metrics);

        // When & Then
        mockMvc.perform(get("/api/workflow/metrics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processStats.totalInstances").value(100));
    }
}
