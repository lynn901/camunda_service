package com.example.workflow;

import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Camunda 7 中心化工作流服务启动入口。
 *
 * <p>@EnableProcessApplication 告知 Camunda Spring Boot Starter 将此应用注册为
 * 一个"流程应用"，自动扫描 {@code src/main/resources/processes/} 目录下的所有 BPMN 文件并部署。
 */
@SpringBootApplication
@EnableProcessApplication("camunda-workflow-service")
public class CamundaWorkflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(CamundaWorkflowApplication.class, args);
    }
}
