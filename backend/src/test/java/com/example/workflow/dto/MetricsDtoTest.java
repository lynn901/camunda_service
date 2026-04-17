package com.example.workflow.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MetricsDtoTest {

    @Test
    public void testMetricsDtoStructure() {
        MetricsDto metricsDto = new MetricsDto();
        
        MetricsDto.ProcessStats processStats = new MetricsDto.ProcessStats();
        processStats.setTotalInstances(10L);
        processStats.setRunningInstances(5L);
        processStats.setCompletedInstances(3L);
        processStats.setSuspendedInstances(2L);
        
        MetricsDto.TaskMetrics taskMetrics = new MetricsDto.TaskMetrics();
        taskMetrics.setTaskBacklogs(20L);
        taskMetrics.setAvgCompletionTime(1500.5);
        taskMetrics.setFailureRate(0.05);
        
        MetricsDto.SystemHealth systemHealth = new MetricsDto.SystemHealth();
        systemHealth.setCpuUsage(45.5);
        systemHealth.setMemoryUsage(2048L);
        systemHealth.setDbConnections(5L);
        
        metricsDto.setProcessStats(processStats);
        metricsDto.setTaskMetrics(taskMetrics);
        metricsDto.setSystemHealth(systemHealth);
        
        assertNotNull(metricsDto.getProcessStats());
        assertEquals(10L, metricsDto.getProcessStats().getTotalInstances());
        
        assertNotNull(metricsDto.getTaskMetrics());
        assertEquals(20L, metricsDto.getTaskMetrics().getTaskBacklogs());
        
        assertNotNull(metricsDto.getSystemHealth());
        assertEquals(45.5, metricsDto.getSystemHealth().getCpuUsage());
    }
}
