package com.jianluochat.controller;

import com.jianluochat.entity.User;
import com.jianluochat.service.RealMatrixService;
import com.jianluochat.service.MatrixRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/matrix/test")
@CrossOrigin(origins = "*")
public class MatrixTestController {

    @Autowired
    private RealMatrixService realMatrixService;
    
    @Autowired
    private MatrixRoomService matrixRoomService;

    /**
     * 测试Matrix服务器连接
     */
    @GetMapping("/connection")
    public ResponseEntity<?> testConnection() {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("homeserver", realMatrixService.getHomeserverUrl());
            result.put("status", "Matrix服务配置正常");
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 测试Matrix用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> testLogin(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名和密码不能为空"));
            }
            
            // 创建临时用户对象用于测试
            User testUser = new User();
            testUser.setUsername(username);
            
            String accessToken = realMatrixService.loginUser(testUser, password).join();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Matrix登录成功");
            result.put("username", username);
            result.put("hasToken", accessToken != null && !accessToken.isEmpty());
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Matrix登录失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 测试获取世界频道
     */
    @GetMapping("/world-channel")
    public ResponseEntity<?> testWorldChannel() {
        try {
            Map<String, Object> worldChannel = matrixRoomService.getWorldChannel().join();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("worldChannel", worldChannel);
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "获取世界频道失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 测试Matrix房间创建
     */
    @PostMapping("/create-room")
    public ResponseEntity<?> testCreateRoom(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String roomName = request.get("roomName");
            
            if (username == null || roomName == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名和房间名不能为空"));
            }
            
            // 创建临时用户对象用于测试
            User testUser = new User();
            testUser.setUsername(username);
            
            String roomId = realMatrixService.createRoom(testUser, roomName, true).join();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Matrix房间创建成功");
            result.put("roomId", roomId);
            result.put("roomName", roomName);
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "创建Matrix房间失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 测试Matrix消息发送
     */
    @PostMapping("/send-message")
    public ResponseEntity<?> testSendMessage(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String roomId = request.get("roomId");
            String message = request.get("message");

            if (username == null || roomId == null || message == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名、房间ID和消息内容不能为空"));
            }

            // 创建临时用户对象用于测试
            User testUser = new User();
            testUser.setUsername(username);

            Map<String, Object> result = matrixRoomService.sendMessage(testUser, roomId, message).join();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Matrix消息发送成功");
            response.put("messageInfo", result);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "发送Matrix消息失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 测试获取房间消息
     */
    @PostMapping("/get-messages")
    public ResponseEntity<?> testGetMessages(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String roomId = request.get("roomId");
            int limit = Integer.parseInt(request.getOrDefault("limit", "10"));

            if (username == null || roomId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名和房间ID不能为空"));
            }

            // 创建临时用户对象用于测试
            User testUser = new User();
            testUser.setUsername(username);

            List<Map<String, Object>> messages = matrixRoomService.getRoomMessages(testUser, roomId, limit).join();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roomId", roomId);
            response.put("messageCount", messages.size());
            response.put("messages", messages);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "获取房间消息失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 测试Matrix同步
     */
    @PostMapping("/sync")
    public ResponseEntity<?> testSync(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String since = request.get("since");

            if (username == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名不能为空"));
            }

            // 创建临时用户对象用于测试
            User testUser = new User();
            testUser.setUsername(username);

            Map<String, Object> syncResult = realMatrixService.syncMatrix(testUser, since).join();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("syncResult", syncResult);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Matrix同步失败: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 获取Matrix服务状态
     */
    @GetMapping("/status")
    public ResponseEntity<?> getMatrixStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "JianluoChat Matrix Integration");
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
}
