package com.jianluochat.controller;

import com.jianluochat.matrix.MatrixClientService;
import com.jianluochat.matrix.MatrixSyncService;
// 移除Matrix SDK依赖，使用Map代替
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/matrix")
@PreAuthorize("hasRole('USER')")
public class MatrixController {

    @Autowired
    private MatrixClientService matrixClientService;

    @Autowired
    private MatrixSyncService matrixSyncService;

    /**
     * Login to Matrix homeserver
     */
    @PostMapping("/login")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> login(
            @RequestBody Map<String, String> loginRequest) {
        
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        
        return matrixClientService.login(username, password)
            .thenApply(loginResponse -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("userId", loginResponse.get("userId"));
                response.put("deviceId", loginResponse.get("deviceId"));
                response.put("message", "Successfully logged in to Matrix");
                
                // Start sync after successful login
                matrixSyncService.startSync();
                
                return ResponseEntity.ok(response);
            })
            .exceptionally(throwable -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", throwable.getMessage());
                return ResponseEntity.badRequest().body(response);
            });
    }

    /**
     * Register a new user on Matrix homeserver
     */
    @PostMapping("/register")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> register(
            @RequestBody Map<String, String> registerRequest) {
        
        String username = registerRequest.get("username");
        String password = registerRequest.get("password");
        
        return matrixClientService.register(username, password)
            .thenApply(userId -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("userId", userId);
                response.put("message", "User registered successfully");
                return ResponseEntity.ok(response);
            })
            .exceptionally(throwable -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", throwable.getMessage());
                return ResponseEntity.badRequest().body(response);
            });
    }

    /**
     * Create a new room
     */
    @PostMapping("/rooms")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> createRoom(
            @RequestBody Map<String, Object> roomRequest) {
        
        String roomName = (String) roomRequest.get("name");
        Boolean isPublic = (Boolean) roomRequest.getOrDefault("public", false);
        
        return matrixClientService.createRoom(roomName, isPublic)
            .thenApply(createRoomResponse -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("roomId", createRoomResponse.get("roomId"));
                response.put("message", "Room created successfully");
                return ResponseEntity.ok(response);
            })
            .exceptionally(throwable -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", throwable.getMessage());
                return ResponseEntity.badRequest().body(response);
            });
    }

    /**
     * Join a room
     */
    @PostMapping("/rooms/{roomId}/join")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> joinRoom(
            @PathVariable String roomId) {
        
        return matrixClientService.joinRoom(roomId)
            .thenApply(result -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("roomId", roomId);
                response.put("message", "Successfully joined room");
                return ResponseEntity.ok(response);
            })
            .exceptionally(throwable -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", throwable.getMessage());
                return ResponseEntity.badRequest().body(response);
            });
    }

    /**
     * Send a message to a room
     */
    @PostMapping("/rooms/{roomId}/messages")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> sendMessage(
            @PathVariable String roomId,
            @RequestBody Map<String, String> messageRequest) {
        
        String message = messageRequest.get("message");
        
        return matrixClientService.sendMessage(roomId, message)
            .thenApply(result -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("roomId", roomId);
                response.put("message", "Message sent successfully");
                return ResponseEntity.ok(response);
            })
            .exceptionally(throwable -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", throwable.getMessage());
                return ResponseEntity.badRequest().body(response);
            });
    }

    /**
     * Get sync status
     */
    @GetMapping("/sync/status")
    public ResponseEntity<Map<String, Object>> getSyncStatus() {
        MatrixSyncService.SyncStatus status = matrixSyncService.getSyncStatus();
        
        Map<String, Object> response = new HashMap<>();
        response.put("syncing", status.isSyncing());
        response.put("userId", status.getUserId());
        response.put("nextBatch", status.getNextBatch());
        response.put("authenticated", matrixClientService.isAuthenticated());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Start sync manually
     */
    @PostMapping("/sync/start")
    public ResponseEntity<Map<String, Object>> startSync() {
        if (!matrixClientService.isAuthenticated()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Not authenticated with Matrix homeserver");
            return ResponseEntity.badRequest().body(response);
        }
        
        matrixSyncService.startSync();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Sync started");
        return ResponseEntity.ok(response);
    }

    /**
     * Stop sync
     */
    @PostMapping("/sync/stop")
    public ResponseEntity<Map<String, Object>> stopSync() {
        matrixSyncService.stopSync();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Sync stopped");
        return ResponseEntity.ok(response);
    }

    /**
     * Get Matrix client status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", matrixClientService.isAuthenticated());
        response.put("userId", matrixClientService.getCurrentUserId());
        response.put("syncing", matrixSyncService.isSyncing());
        
        return ResponseEntity.ok(response);
    }
}
