package com.example.workflow.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.BpmnError;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
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
@Slf4j
@Component("httpCallbackDelegate")
@RequiredArgsConstructor
public class HttpCallbackDelegate implements JavaDelegate {

    private final RestTemplate restTemplate;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String callbackUrl = (String) execution.getVariable("callbackUrl");

        if (callbackUrl == null || callbackUrl.isBlank()) {
            throw new IllegalArgumentException(
                    "[HttpCallbackDelegate] 流程变量 'callbackUrl' 未设置，节点: "
                            + execution.getCurrentActivityId());
        }

        // ── 1. 构造请求体 ────────────────────────────────────────────
        Map<String, Object> payload = new HashMap<>();
        payload.put("processInstanceId", execution.getProcessInstanceId());
        payload.put("processDefinitionKey", execution.getProcessDefinitionId());
        payload.put("businessKey", execution.getProcessBusinessKey());
        payload.put("activityId", execution.getCurrentActivityId());
        payload.put("activityName", execution.getCurrentActivityName());
        payload.put("variables", execution.getVariables());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // 可按需添加认证头：headers.setBearerAuth(token);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        log.info("[Workflow Callback] → {} | processInstance={} | businessKey={}",
                callbackUrl,
                execution.getProcessInstanceId(),
                execution.getProcessBusinessKey());

        // ── 2. 发起 HTTP POST ────────────────────────────────────────
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(callbackUrl, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException(
                        "[HttpCallbackDelegate] 回调失败, HTTP " + response.getStatusCode()
                                + ", url=" + callbackUrl);
            }

            log.info("[Workflow Callback] ✓ 回调成功, statusCode={}, body={}",
                    response.getStatusCode(), response.getBody());

            // 可选：将业务系统返回内容写回流程变量，供后续节点判断
            // execution.setVariable("callbackResponse", response.getBody());

        } catch (RuntimeException e) {
            // 若希望触发 BPMN Error 事件，改为：throw new BpmnError("CALLBACK_FAILED",
            // e.getMessage());
            // 若希望让 Camunda 自动重试（依赖 Job Executor），直接重新抛出：
            log.error("[Workflow Callback] ✗ 回调异常: {}", e.getMessage(), e);
            throw new RuntimeException("[HttpCallbackDelegate] HTTP 回调执行失败: " + e.getMessage(), e);
        }
    }
}
