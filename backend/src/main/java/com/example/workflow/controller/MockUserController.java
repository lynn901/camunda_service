package com.example.workflow.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Mock User Controller for Ant Design Pro.
 * Simulates a simple session-based authentication flow.
 */
@RestController
@RequestMapping("/api")
public class MockUserController {

    private static final String COOKIE_NAME = "MOCK_SESSION_ID";

    @GetMapping("/currentUser")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @CookieValue(name = COOKIE_NAME, required = false) String sessionId) {

        if (sessionId == null || !sessionId.equals("mock-admin-session")) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("errorCode", "401");
            error.put("errorMessage", "Not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        Map<String, Object> user = new HashMap<>();
        user.put("success", true);
        
        Map<String, Object> data = new HashMap<>();
        data.put("name", "Admin");
        data.put("avatar", "https://gw.alipayobjects.com/zos/antfincdn/XAoskVENvL/BiazfanxmamNRoxxVxka.png");
        data.put("userid", "00000001");
        data.put("email", "admin@example.com");
        data.put("access", "admin");
        
        user.put("data", data);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login/account")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginParams) {
        String username = loginParams.get("username");
        String password = loginParams.get("password");

        Map<String, Object> result = new HashMap<>();
        
        if ("admin".equals(username) && "admin".equals(password)) {
            result.put("status", "ok");
            result.put("type", "account");
            result.put("currentAuthority", "admin");

            ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "mock-admin-session")
                    .httpOnly(true)
                    .path("/")
                    .maxAge(3600)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(result);
        } else {
            result.put("status", "error");
            result.put("type", "account");
            result.put("currentAuthority", "guest");
            return ResponseEntity.status(HttpStatus.OK).body(result);
        }
    }

    @PostMapping("/login/outLogin")
    public ResponseEntity<Map<String, Object>> logout() {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result);
    }
}
