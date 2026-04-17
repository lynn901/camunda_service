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
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Date;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
