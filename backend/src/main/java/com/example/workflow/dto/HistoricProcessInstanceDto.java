package com.example.workflow.dto;

import java.util.Date;

public class HistoricProcessInstanceDto {
    private String instanceId;
    private String processDefinitionKey;
    private String businessKey;
    private Date startTime;
    private Date endTime;
    private String state;
    private Long durationInMillis;

    public HistoricProcessInstanceDto() {}

    public HistoricProcessInstanceDto(String instanceId, String processDefinitionKey, String businessKey, Date startTime, Date endTime, String state, Long durationInMillis) {
        this.instanceId = instanceId;
        this.processDefinitionKey = processDefinitionKey;
        this.businessKey = businessKey;
        this.startTime = startTime;
        this.endTime = endTime;
        this.state = state;
        this.durationInMillis = durationInMillis;
    }

    // Getters and Setters
    public String getInstanceId() { return instanceId; }
    public void setInstanceId(String instanceId) { this.instanceId = instanceId; }
    public String getProcessDefinitionKey() { return processDefinitionKey; }
    public void setProcessDefinitionKey(String processDefinitionKey) { this.processDefinitionKey = processDefinitionKey; }
    public String getBusinessKey() { return businessKey; }
    public void setBusinessKey(String businessKey) { this.businessKey = businessKey; }
    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }
    public Date getEndTime() { return endTime; }
    public void setEndTime(Date endTime) { this.endTime = endTime; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Long getDurationInMillis() { return durationInMillis; }
    public void setDurationInMillis(Long durationInMillis) { this.durationInMillis = durationInMillis; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String instanceId;
        private String processDefinitionKey;
        private String businessKey;
        private Date startTime;
        private Date endTime;
        private String state;
        private Long durationInMillis;

        public Builder instanceId(String instanceId) { this.instanceId = instanceId; return this; }
        public Builder processDefinitionKey(String processDefinitionKey) { this.processDefinitionKey = processDefinitionKey; return this; }
        public Builder businessKey(String businessKey) { this.businessKey = businessKey; return this; }
        public Builder startTime(Date startTime) { this.startTime = startTime; return this; }
        public Builder endTime(Date endTime) { this.endTime = endTime; return this; }
        public Builder state(String state) { this.state = state; return this; }
        public Builder durationInMillis(Long durationInMillis) { this.durationInMillis = durationInMillis; return this; }

        public HistoricProcessInstanceDto build() {
            return new HistoricProcessInstanceDto(instanceId, processDefinitionKey, businessKey, startTime, endTime, state, durationInMillis);
        }
    }
}
