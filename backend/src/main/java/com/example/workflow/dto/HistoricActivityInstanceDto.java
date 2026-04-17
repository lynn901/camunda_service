package com.example.workflow.dto;

import java.util.Date;

public class HistoricActivityInstanceDto {
    private String activityId;
    private String activityName;
    private String activityType;
    private Date startTime;
    private Date endTime;
    private Long durationInMillis;

    public HistoricActivityInstanceDto() {}

    public HistoricActivityInstanceDto(String activityId, String activityName, String activityType, Date startTime, Date endTime, Long durationInMillis) {
        this.activityId = activityId;
        this.activityName = activityName;
        this.activityType = activityType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationInMillis = durationInMillis;
    }

    // Getters and Setters
    public String getActivityId() { return activityId; }
    public void setActivityId(String activityId) { this.activityId = activityId; }
    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }
    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }
    public Date getEndTime() { return endTime; }
    public void setEndTime(Date endTime) { this.endTime = endTime; }
    public Long getDurationInMillis() { return durationInMillis; }
    public void setDurationInMillis(Long durationInMillis) { this.durationInMillis = durationInMillis; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String activityId;
        private String activityName;
        private String activityType;
        private Date startTime;
        private Date endTime;
        private Long durationInMillis;

        public Builder activityId(String activityId) { this.activityId = activityId; return this; }
        public Builder activityName(String activityName) { this.activityName = activityName; return this; }
        public Builder activityType(String activityType) { this.activityType = activityType; return this; }
        public Builder startTime(Date startTime) { this.startTime = startTime; return this; }
        public Builder endTime(Date endTime) { this.endTime = endTime; return this; }
        public Builder durationInMillis(Long durationInMillis) { this.durationInMillis = durationInMillis; return this; }

        public HistoricActivityInstanceDto build() {
            return new HistoricActivityInstanceDto(activityId, activityName, activityType, startTime, endTime, durationInMillis);
        }
    }
}
