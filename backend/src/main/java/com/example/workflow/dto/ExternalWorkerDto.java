package com.example.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalWorkerDto {
    private String workerId;
    private int activeTasks;
    private Set<String> topics;
    private Date lastSeen;
    private String status; // Online, HighLoad, Offline (Inferred)
}
