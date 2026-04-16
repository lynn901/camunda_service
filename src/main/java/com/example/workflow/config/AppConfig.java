package com.example.workflow.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * 公共 Bean 配置：RestTemplate（用于 HTTP 回调模式）。
 *
 * <p>生产环境建议针对不同业务系统配置专属超时，防止慢回调拖垮线程池。
 * 可使用 Apache HttpClient 或 OkHttp 替换底层实现以获得连接池管理能力。
 */
@Configuration
public class AppConfig {

    /**
     * 通用 RestTemplate Bean，连接超时 5s，读超时 15s。
     *
     * <p>注意：超时参数应与 BPMN Service Task 上的"Asynchronous Before"配合。
     * 即使读超时抛出异常，Camunda Job Executor 会捕获并创建 Incident，
     * 不会阻塞前端请求线程。
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(15))
                .build();
    }
}
