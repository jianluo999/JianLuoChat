package com.jianluochat.controller;

import com.jianluochat.service.RealMatrixService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/matrix/servers")
@CrossOrigin(origins = "*")
public class MatrixServerController {

    private static final Logger logger = LoggerFactory.getLogger(MatrixServerController.class);

    @Autowired
    private RealMatrixService realMatrixService;

    /**
     * 获取服务器信息
     */
    @GetMapping("/{serverName}")
    public ResponseEntity<?> getServerInfo(@PathVariable String serverName) {
        try {
            logger.info("Getting server info for: {}", serverName);
            
            Map<String, Object> serverInfo = new HashMap<>();
            serverInfo.put("name", serverName);
            serverInfo.put("status", "online");
            serverInfo.put("description", "Matrix homeserver: " + serverName);
            serverInfo.put("version", "Matrix Protocol v1.0");
            serverInfo.put("federation", true);
            serverInfo.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(serverInfo);
            
        } catch (Exception e) {
            logger.error("Failed to get server info for {}: {}", serverName, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get server info: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 发现可用的Matrix服务器
     */
    @GetMapping("")
    public ResponseEntity<?> discoverServers() {
        try {
            Map<String, Object> servers = new HashMap<>();
            servers.put("recommended", new String[]{
                "matrix.org",
                "mozilla.org", 
                "kde.org",
                "jianluochat.com"
            });
            servers.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(servers);
            
        } catch (Exception e) {
            logger.error("Failed to discover servers: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to discover servers: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 测试服务器连接
     */
    @PostMapping("/{serverName}/test")
    public ResponseEntity<?> testServerConnection(@PathVariable String serverName) {
        try {
            logger.info("Testing connection to server: {}", serverName);
            
            // 这里可以实际测试服务器连接
            // 目前返回模拟结果
            Map<String, Object> result = new HashMap<>();
            result.put("server", serverName);
            result.put("reachable", true);
            result.put("responseTime", 150);
            result.put("version", "Synapse 1.0");
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Failed to test server connection for {}: {}", serverName, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Server connection test failed: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
}
