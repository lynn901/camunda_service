package com.example.workflow.delegate;

import org.camunda.bpm.engine.delegate.BpmnError;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 通用 HTTP 回调委托（模式一：Webhook / HTTP Push）。
 *
 * <h2>使用方式</h2>
 * <ol>
 * <li>在 BPMN 设计器中，将 Service Task 的 Implementation 设为
 * {@code Delegate Expression} → {@code ${httpCallbackDelegate}}。</li>
 * <li>建议在节点上勾选 <strong>Asynchronous Before</strong>，使 HTTP 调用
 * 在独立 Job 线程中执行，避免阻塞主流程事务。</li>
 * <li>通过流程变量或节点扩展属性传入 {@code callbackUrl}（必填）。</li>
 * </ol>
 *
 * <h2>约定变量</h2>
 * <ul>
 * <li>{@code callbackUrl} — 目标系统回调地址 (必填)</li>
 * <li>{@code callbackTimeout} — 覆盖默认超时(毫秒，可选)</li>
 * </ul>
 *
 * <h2>可靠性</h2>
 * <ul>
 * <li>HTTP 非 2xx 或网络异常 → 抛出 RuntimeException → Camunda 记录 Incident
 * 等待人工处理或自动重试。</li>
 * <li>业务系统明确返回失败 → 抛出 {@link BpmnError} 触发 BPMN 错误边界事件流转。</li>
 * </ul>
 */
@Component("httpCallbackDelegate")
public class HttpCallbackDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(HttpCallbackDelegate.class);

    private final RestTemplate restTemplate;

    public HttpCallbackDelegate(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String callbackUrl = (String) execution.getVariable("callbackUrl");

        if (callbackUrl == null || callbackUrl.isBlank()) {
            throw new IllegalArgumentException(
                    "[HttpCallbackDelegate] 流程变量 'callbackUrl' 未设置，节点: " 
                    + execution.getCurrentActivityName());
        }

        log.info("[HttpCallbackDelegate] 发起回调 | instanceId={} | activity={} | url={}",
                execution.getProcessInstanceId(), execution.getCurrentActivityName(), callbackUrl);

        // 构建请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 构建请求体（包含当前所有流程变量）
        Map<String, Object> body = new HashMap<>(execution.getVariables());
        body.put("executionId", execution.getId());
        body.put("processInstanceId", execution.getProcessInstanceId());
        body.put("activityId", execution.getCurrentActivityId());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(callbackUrl, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[HttpCallbackDelegate] 回调成功 | status={}", response.getStatusCode());
                
                // 如果业务系统返回了变量，同步更新到引擎
                if (response.getBody() != null) {
                    execution.setVariables(response.getBody());
                }
            } else {
                log.error("[HttpCallbackDelegate] 回调业务失败 | status={} | body={}", 
                        response.getStatusCode(), response.getBody());
                // 抛出 BPMN Error，允许流程图中通过 Error Boundary Event 捕获
                throw new BpmnError("CALLBACK_BUSINESS_FAILURE", "业务系统返回错误状态码: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[HttpCallbackDelegate] HTTP 请求异常 | error={}", e.getMessage());
            // 抛出普通异常，触发 Camunda 重试机制 (Job Executor Retries)
            throw e;
        }
    }
}
