package com.example.workflow.service;

import com.example.workflow.dto.MetricsDto;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.search.Search;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.ManagementService;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.history.HistoricProcessInstanceQuery;
import org.camunda.bpm.engine.runtime.ProcessInstanceQuery;
import org.camunda.bpm.engine.task.TaskQuery;
import org.camunda.bpm.engine.runtime.IncidentQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkflowServiceMetricsTest {

    @Mock
    private RuntimeService runtimeService;
    @Mock
    private TaskService taskService;
    @Mock
    private HistoryService historyService;
    @Mock
    private ManagementService managementService;
    @Mock
    private RepositoryService repositoryService;
    @Mock
    private MeterRegistry meterRegistry;

    @InjectMocks
    private WorkflowService workflowService;

    @Test
    void shouldReturnOverallMetrics() {
        // Process Stats Mocks
        HistoricProcessInstanceQuery hpiq = mock(HistoricProcessInstanceQuery.class);
        when(historyService.createHistoricProcessInstanceQuery()).thenReturn(hpiq);
        when(hpiq.count()).thenReturn(100L);
        when(hpiq.finished()).thenReturn(hpiq);
        when(hpiq.listPage(0, 100)).thenReturn(Collections.emptyList());
        
        ProcessInstanceQuery piq = mock(ProcessInstanceQuery.class);
        when(runtimeService.createProcessInstanceQuery()).thenReturn(piq);
        when(piq.count()).thenReturn(20L);
        when(piq.suspended()).thenReturn(piq);

        // Task Metrics Mocks
        TaskQuery tq = mock(TaskQuery.class);
        when(taskService.createTaskQuery()).thenReturn(tq);
        when(tq.count()).thenReturn(10L);

        IncidentQuery iq = mock(IncidentQuery.class);
        when(runtimeService.createIncidentQuery()).thenReturn(iq);
        when(iq.count()).thenReturn(2L);

        // System Health Mocks
        Search search = mock(Search.class);
        when(meterRegistry.find(anyString())).thenReturn(search);
        when(search.gauge()).thenReturn(null);

        // When
        MetricsDto metrics = workflowService.getOverallMetrics();

        // Then
        assertThat(metrics).isNotNull();
        assertThat(metrics.getProcessStats().getTotalInstances()).isEqualTo(100L);
        assertThat(metrics.getTaskMetrics().getTaskBacklogs()).isEqualTo(10L);
        assertThat(metrics.getSystemHealth()).isNotNull();
    }
}
