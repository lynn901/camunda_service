package com.example.workflow.controller;

import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.DeploymentBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.io.InputStream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext
class WorkflowDeploymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RepositoryService repositoryService;

    @Test
    void shouldDeployBpmnFileSuccessfully() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-process.bpmn",
                MediaType.TEXT_XML_VALUE,
                "<bpmn:definitions ... />".getBytes()
        );

        DeploymentBuilder builder = mock(DeploymentBuilder.class);
        Deployment deployment = mock(Deployment.class);

        when(repositoryService.createDeployment()).thenReturn(builder);
        when(builder.addInputStream(anyString(), any(InputStream.class))).thenReturn(builder);
        when(builder.name(anyString())).thenReturn(builder);
        when(builder.deploy()).thenReturn(deployment);
        when(deployment.getId()).thenReturn("deploy-123");

        // When & Then
        mockMvc.perform(multipart("/api/workflow/deploy")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deploymentId").value("deploy-123"))
                .andExpect(jsonPath("$.resourceName").value("test-process.bpmn"));
    }

    @Test
    void shouldReturnBadRequestWhenDeploymentFails() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invalid.bpmn",
                MediaType.TEXT_XML_VALUE,
                "invalid content".getBytes()
        );

        when(repositoryService.createDeployment()).thenThrow(new org.camunda.bpm.engine.ProcessEngineException("Parsing failed"));

        // When & Then
        mockMvc.perform(multipart("/api/workflow/deploy")
                .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Workflow Engine Error"));
    }
}
