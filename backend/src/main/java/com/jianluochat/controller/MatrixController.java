package com.jianluochat.controller;

import com.jianluochat.entity.User;
import com.jianluochat.service.RealMatrixService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/matrix")
@CrossOrigin(origins = "*")
public class MatrixController {

    private static final Logger logger = LoggerFactory.getLogger(MatrixController.class);

    @Autowired
    private RealMatrixService realMatrixService;

    /**
     * Matrix用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> matrixLogin(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String homeserver = request.get("homeserver");
            
            logger.info("Matrix login attempt for user: {} on homeserver: {}", username, homeserver);
            
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "用户名和密码不能为空"
                ));
            }
            
            // 创建用户对象
            User user = new User();
            user.setUsername(username);
            
            // 调用Matrix登录
            String accessToken = realMatrixService.loginUser(user, password, homeserver != null ? homeserver : "matrix.org").join();
            
            if (accessToken != null && !accessToken.isEmpty()) {
                // Matrix同步将在WebSocket连接时启动

                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("message", "Matrix登录成功");
                result.put("username", username);
                result.put("userId", "@" + username + ":" + (homeserver != null ? homeserver : "matrix.org"));
                result.put("accessToken", accessToken);
                result.put("homeserver", homeserver);
                result.put("timestamp", System.currentTimeMillis());
                
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Matrix登录失败：无效的凭据"
                ));
            }
            
        } catch (Exception e) {
            logger.error("Matrix login failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Matrix登录失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * Matrix用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> matrixRegister(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String homeserver = request.get("homeserver");
            
            logger.info("Matrix register attempt for user: {} on homeserver: {}", username, homeserver);
            
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "用户名和密码不能为空"
                ));
            }
            
            // 创建用户对象
            User user = new User();
            user.setUsername(username);
            
            // 调用Matrix注册
            String accessToken = realMatrixService.registerUser(user, password).join();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Matrix注册成功");
            result.put("username", username);
            result.put("userId", "@" + username + ":" + (homeserver != null ? homeserver : "matrix.org"));
            result.put("accessToken", accessToken);
            result.put("homeserver", homeserver);
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Matrix register failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Matrix注册失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 获取Matrix连接状态
     */
    @GetMapping("/connection")
    public ResponseEntity<?> getConnectionStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("homeserver", realMatrixService.getHomeserverUrl());
            status.put("connected", true);
            status.put("protocol", "Matrix Protocol v1.0");
            status.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            logger.error("Failed to get connection status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get connection status: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 获取Matrix状态
     */
    @GetMapping("/status")
    public ResponseEntity<?> getMatrixStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "JianluoChat Matrix Client");
        status.put("version", "1.0.0");
        status.put("homeserver", realMatrixService.getHomeserverUrl());
        status.put("protocol", "Matrix Protocol v1.0");
        status.put("features", Map.of(
            "realTimeMessaging", true,
            "roomManagement", true,
            "userAuthentication", true,
            "federation", true,
            "encryption", false, // 待实现
            "messageHistory", true,
            "realTimeSync", true
        ));
        status.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(status);
    }

    /**
     * 获取世界频道信息
     */
    @GetMapping("/world-channel")
    public ResponseEntity<?> getWorldChannel() {
        try {
            Map<String, Object> worldChannel = new HashMap<>();
            worldChannel.put("id", "world");
            worldChannel.put("name", "世界频道");
            worldChannel.put("type", "world");
            worldChannel.put("description", "全球Matrix用户交流频道");
            worldChannel.put("memberCount", 1000); // 模拟数据
            worldChannel.put("isPublic", true);
            worldChannel.put("encrypted", false);
            worldChannel.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "worldChannel", worldChannel
            ));
        } catch (Exception e) {
            logger.error("Failed to get world channel: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "获取世界频道失败: " + e.getMessage()
            ));
        }
    }


}
