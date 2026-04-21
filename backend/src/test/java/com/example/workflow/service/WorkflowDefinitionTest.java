package com.example.workflow.service;

import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.DeploymentQuery;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.repository.ProcessDefinitionQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkflowDefinitionTest {

    @Mock
    private RepositoryService repositoryService;

    @InjectMocks
    private WorkflowService workflowService;

    @Test
    void shouldReturnAllVersionsOfProcessDefinitions() {
        // Given
        ProcessDefinitionQuery query = mock(ProcessDefinitionQuery.class);
        ProcessDefinition v1 = mock(ProcessDefinition.class);
        ProcessDefinition v2 = mock(ProcessDefinition.class);

        when(v1.getId()).thenReturn("proc:1");
        when(v1.getKey()).thenReturn("proc");
        when(v1.getVersion()).thenReturn(1);
        when(v1.getDeploymentId()).thenReturn("dep1");
        when(v1.getResourceName()).thenReturn("proc.bpmn");
        when(v1.isSuspended()).thenReturn(false);

        when(v2.getId()).thenReturn("proc:2");
        when(v2.getKey()).thenReturn("proc");
        when(v2.getVersion()).thenReturn(2);
        when(v2.getDeploymentId()).thenReturn("dep2");
        when(v2.getResourceName()).thenReturn("proc.bpmn");
        when(v2.isSuspended()).thenReturn(false);

        when(repositoryService.createProcessDefinitionQuery()).thenReturn(query);
        when(query.orderByProcessDefinitionKey()).thenReturn(query);
        when(query.asc()).thenReturn(query);
        when(query.orderByProcessDefinitionVersion()).thenReturn(query);
        when(query.desc()).thenReturn(query);
        when(query.list()).thenReturn(Arrays.asList(v2, v1)); // Version 2 then Version 1

        DeploymentQuery depQuery = mock(DeploymentQuery.class);
        Deployment d1 = mock(Deployment.class);
        when(d1.getId()).thenReturn("dep1");
        when(d1.getDeploymentTime()).thenReturn(new Date());
        
        when(repositoryService.createDeploymentQuery()).thenReturn(depQuery);
        when(depQuery.list()).thenReturn(Collections.singletonList(d1));

        // When
        List<Map<String, Object>> results = workflowService.getDeployedProcessDefinitions();

        // Then
        assertThat(results).hasSize(2);
        assertThat(results.get(0).get("version")).isEqualTo(2);
        assertThat(results.get(1).get("version")).isEqualTo(1);
        assertThat(results.get(0).get("suspended")).isEqualTo(false);
    }
}
