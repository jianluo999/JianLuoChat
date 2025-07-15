package com.jianluochat.service;

import com.jianluochat.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class MatrixRoomService {
    
    private static final Logger logger = LoggerFactory.getLogger(MatrixRoomService.class);
    
    @Autowired
    private RealMatrixService realMatrixService;

    public CompletableFuture<Map<String, Object>> getWorldChannel() {
        return realMatrixService.getWorldChannel();
    }

    public CompletableFuture<Map<String, Object>> sendMessage(User sender, String roomId, String message) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String eventId = realMatrixService.sendMessage(sender, roomId, message).join();
                
                Map<String, Object> messageInfo = new HashMap<>();
                messageInfo.put("id", eventId);
                messageInfo.put("roomId", roomId);
                messageInfo.put("content", message);
                
                Map<String, Object> senderInfo = new HashMap<>();
                senderInfo.put("id", sender.getId());
                senderInfo.put("username", sender.getUsername());
                senderInfo.put("displayName", sender.getDisplayName());
                messageInfo.put("sender", senderInfo);
                
                messageInfo.put("timestamp", System.currentTimeMillis());
                messageInfo.put("type", "m.text");
                
                return messageInfo;
                
            } catch (Exception e) {
                logger.error("Failed to send message: {}", e.getMessage());
                throw new RuntimeException("发送消息失败", e);
            }
        });
    }

    public CompletableFuture<List<Map<String, Object>>> getUserRooms(User user) {
        return realMatrixService.getUserRooms(user);
    }

    public CompletableFuture<List<Map<String, Object>>> getRoomMessages(User user, String roomId, int limit) {
        return realMatrixService.getRoomMessages(user, roomId, limit);
    }

    public CompletableFuture<String> loginUser(User user, String password) {
        return realMatrixService.loginUser(user, password);
    }

    public boolean isUserLoggedIn(String username) {
        return realMatrixService.isUserLoggedIn(username);
    }

    public CompletableFuture<Map<String, Object>> getUserPrivateRoom(User user) {
        return CompletableFuture.supplyAsync(() -> {
            // 为用户创建或获取私人房间
            Map<String, Object> privateRoom = new HashMap<>();
            privateRoom.put("id", "private_" + user.getId());
            privateRoom.put("name", "私人房间");
            privateRoom.put("type", "private");
            privateRoom.put("members", List.of(user.getUsername()));
            privateRoom.put("memberCount", 1);
            privateRoom.put("unreadCount", 0);
            return privateRoom;
        });
    }

    public CompletableFuture<Map<String, Object>> createPrivateRoom(User user) {
        return getUserPrivateRoom(user);
    }

    public CompletableFuture<Map<String, Object>> createGroupRoom(User user, String roomName, String description) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 使用RealMatrixService创建真正的Matrix房间
                String roomId = realMatrixService.createRoom(user, roomName, true).join();

                Map<String, Object> roomInfo = new HashMap<>();
                roomInfo.put("id", roomId);
                roomInfo.put("name", roomName);
                roomInfo.put("description", description);
                roomInfo.put("type", "group");
                roomInfo.put("creator", user.getUsername());
                roomInfo.put("members", List.of(user.getUsername()));
                roomInfo.put("memberCount", 1);
                roomInfo.put("unreadCount", 0);

                return roomInfo;

            } catch (Exception e) {
                logger.error("Failed to create group room: {}", e.getMessage());
                throw new RuntimeException("创建群组房间失败", e);
            }
        });
    }

    public CompletableFuture<Void> joinRoom(User user, String roomId) {
        return realMatrixService.joinRoom(user, roomId);
    }

    public CompletableFuture<Void> leaveRoom(User user, String roomId) {
        return CompletableFuture.runAsync(() -> {
            try {
                // 调用Matrix离开房间API
                logger.info("User {} leaving room {}", user.getUsername(), roomId);
                // 这里需要实现Matrix离开房间的逻辑
            } catch (Exception e) {
                logger.error("Failed to leave room {} for user {}: {}", roomId, user.getUsername(), e.getMessage());
                throw new RuntimeException("离开房间失败", e);
            }
        });
    }

    public CompletableFuture<Void> ensureUserLoggedIn(String username) {
        return CompletableFuture.runAsync(() -> {
            if (!realMatrixService.isUserLoggedIn(username)) {
                logger.warn("User {} is not logged into Matrix", username);
                throw new RuntimeException("用户未登录Matrix");
            }
        });
    }
}
