package com.example.workflow.service;

import com.example.workflow.dto.HistoricProcessInstanceDto;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.history.HistoricProcessInstanceQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkflowServiceTest {

    @Mock
    private RuntimeService runtimeService;
    @Mock
    private TaskService taskService;
    @Mock
    private HistoryService historyService;
    @Mock
    private RepositoryService repositoryService;

    @InjectMocks
    private WorkflowService workflowService;

    @Test
    void shouldReturnHistoricInstancesAsDto() {
        // Given
        String businessKey = "BK-123";
        HistoricProcessInstanceQuery query = mock(HistoricProcessInstanceQuery.class);
        HistoricProcessInstance instance = mock(HistoricProcessInstance.class);
        
        Date startTime = new Date();
        Date endTime = new Date();
        
        when(instance.getId()).thenReturn("inst-1");
        when(instance.getProcessDefinitionKey()).thenReturn("proc-1");
        when(instance.getBusinessKey()).thenReturn(businessKey);
        when(instance.getStartTime()).thenReturn(startTime);
        when(instance.getEndTime()).thenReturn(endTime);
        when(instance.getState()).thenReturn("COMPLETED");
        when(instance.getDurationInMillis()).thenReturn(100L);
        
        when(historyService.createHistoricProcessInstanceQuery()).thenReturn(query);
        when(query.processInstanceBusinessKey(anyString())).thenReturn(query);
        when(query.orderByProcessInstanceEndTime()).thenReturn(query);
        when(query.desc()).thenReturn(query);
        when(query.list()).thenReturn(Collections.singletonList(instance));

        // When
        List<HistoricProcessInstanceDto> results = workflowService.getHistoricInstancesDto(businessKey);

        // Then
        assertThat(results).hasSize(1);
        HistoricProcessInstanceDto dto = results.get(0);
        assertThat(dto.getInstanceId()).isEqualTo("inst-1");
        assertThat(dto.getProcessDefinitionKey()).isEqualTo("proc-1");
        assertThat(dto.getBusinessKey()).isEqualTo(businessKey);
        assertThat(dto.getStartTime()).isEqualTo(startTime);
        assertThat(dto.getEndTime()).isEqualTo(endTime);
        assertThat(dto.getState()).isEqualTo("COMPLETED");
        assertThat(dto.getDurationInMillis()).isEqualTo(100L);
    }
}
