package com.example.workflow.config;

import org.camunda.bpm.engine.rest.security.auth.ProcessEngineAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

import org.springframework.context.annotation.Profile;

/**
 * 引擎安全配置类 — 开启 REST API 的 Basic Auth 认证。
 *
 * <p>
 * 基于 Camunda 原生 {@link ProcessEngineAuthenticationFilter}，它会拦截请求并
 * 校验 Header 中的 {@code Authorization: Basic base64(user:pass)}。
 * 验证逻辑直接连接 Camunda 的 {@code IdentityService}（即数据库 ACT_ID_USER 表）。
 */
@Configuration
@Profile("!test")
public class CamundaSecurityConfig {

    @Bean
    public FilterRegistrationBean<ProcessEngineAuthenticationFilter> camundaAuthenticationFilter() {
        FilterRegistrationBean<ProcessEngineAuthenticationFilter> registration = new FilterRegistrationBean<>();
        registration.setName("camunda-auth");

        // 注册 Camunda 官方提供的认证过滤器
        registration.setFilter(new ProcessEngineAuthenticationFilter());

        // 【核心配置】：设置拦截路径
        // 1. /engine-rest/*  - 保护 Camunda 原生开放接口
        // 2. /api/workflow/* - 保护本工程自定义的精简版接口
        registration.addUrlPatterns("/engine-rest/*", "/api/workflow/**");

        // 设置初始化参数：指定认证提供者为 Basic Auth
        registration.addInitParameter("authentication-provider", "org.camunda.bpm.engine.rest.security.auth.impl.HttpBasicAuthenticationProvider");

        registration.setOrder(1); // 确保在普通过滤器之前执行
        return registration;
    }
}
