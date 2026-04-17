package com.example.workflow.dto;

public class MetricsDto {
    private ProcessStats processStats;
    private TaskMetrics taskMetrics;
    private SystemHealth systemHealth;

    public MetricsDto() {}

    public ProcessStats getProcessStats() { return processStats; }
    public void setProcessStats(ProcessStats processStats) { this.processStats = processStats; }

    public TaskMetrics getTaskMetrics() { return taskMetrics; }
    public void setTaskMetrics(TaskMetrics taskMetrics) { this.taskMetrics = taskMetrics; }

    public SystemHealth getSystemHealth() { return systemHealth; }
    public void setSystemHealth(SystemHealth systemHealth) { this.systemHealth = systemHealth; }

    public static class ProcessStats {
        private Long totalInstances;
        private Long runningInstances;
        private Long completedInstances;
        private Long suspendedInstances;

        public Long getTotalInstances() { return totalInstances; }
        public void setTotalInstances(Long totalInstances) { this.totalInstances = totalInstances; }
        public Long getRunningInstances() { return runningInstances; }
        public void setRunningInstances(Long runningInstances) { this.runningInstances = runningInstances; }
        public Long getCompletedInstances() { return completedInstances; }
        public void setCompletedInstances(Long completedInstances) { this.completedInstances = completedInstances; }
        public Long getSuspendedInstances() { return suspendedInstances; }
        public void setSuspendedInstances(Long suspendedInstances) { this.suspendedInstances = suspendedInstances; }
    }

    public static class TaskMetrics {
        private Long taskBacklogs;
        private Double avgCompletionTime;
        private Double failureRate;

        public Long getTaskBacklogs() { return taskBacklogs; }
        public void setTaskBacklogs(Long taskBacklogs) { this.taskBacklogs = taskBacklogs; }
        public Double getAvgCompletionTime() { return avgCompletionTime; }
        public void setAvgCompletionTime(Double avgCompletionTime) { this.avgCompletionTime = avgCompletionTime; }
        public Double getFailureRate() { return failureRate; }
        public void setFailureRate(Double failureRate) { this.failureRate = failureRate; }
    }

    public static class SystemHealth {
        private Double cpuUsage;
        private Long memoryUsage;
        private Long dbConnections;

        public Double getCpuUsage() { return cpuUsage; }
        public void setCpuUsage(Double cpuUsage) { this.cpuUsage = cpuUsage; }
        public Long getMemoryUsage() { return memoryUsage; }
        public void setMemoryUsage(Long memoryUsage) { this.memoryUsage = memoryUsage; }
        public Long getDbConnections() { return dbConnections; }
        public void setDbConnections(Long dbConnections) { this.dbConnections = dbConnections; }
    }
}
