package com.jianluochat.service;

import com.jianluochat.entity.User;
import com.jianluochat.matrix.MatrixHomeserver;
import com.jianluochat.matrix.MatrixEvent;
import com.jianluochat.matrix.MatrixUserSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Matrix房间服务
 * 基于真正的Matrix协议实现房间管理
 */
@Service
public class MatrixRoomService {
    
    private static final Logger logger = LoggerFactory.getLogger(MatrixRoomService.class);
    
    @Autowired
    private MatrixHomeserver matrixHomeserver;
    
    // 用户私密房间缓存 userId -> roomId
    private final Map<String, String> userPrivateRooms = new ConcurrentHashMap<>();

    /**
     * 获取或创建世界频道
     */
    public CompletableFuture<Map<String, Object>> getWorldChannel() {
        return CompletableFuture.supplyAsync(() -> {
            String worldRoomId = matrixHomeserver.getWorldRoomId();
            
            Map<String, Object> roomInfo = Map.of(
                "id", worldRoomId,
                "name", "世界频道",
                "alias", worldRoomId,
                "type", "world",
                "topic", "欢迎来到JianluoChat世界频道！这里是所有用户的公共聊天空间。",
                "isPublic", true,
                "memberCount", 0 // 实际应该从Matrix获取
            );
            
            logger.info("World channel info: {}", roomInfo);
            return roomInfo;
        });
    }

    /**
     * 为用户创建私密房间
     */
    public CompletableFuture<Map<String, Object>> createPrivateRoom(User user) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String matrixUserId = matrixHomeserver.buildMatrixUserId(user.getUsername());
                
                // 检查是否已有私密房间
                String existingRoomId = userPrivateRooms.get(matrixUserId);
                if (existingRoomId != null) {
                    return buildRoomInfo(existingRoomId, user.getDisplayName() + "的私密房间", "private");
                }
                
                // 创建新的私密房间
                String roomName = user.getDisplayName() + "的私密房间";
                String roomTopic = "这是" + user.getDisplayName() + "的私密聊天房间，可以邀请朋友加入。";
                
                String roomId = matrixHomeserver.createRoom(matrixUserId, roomName, roomTopic, false).join();
                
                // 缓存房间ID
                userPrivateRooms.put(matrixUserId, roomId);
                
                logger.info("Created private room for user {}: {}", user.getUsername(), roomId);
                
                return buildRoomInfo(roomId, roomName, "private");
                
            } catch (Exception e) {
                logger.error("Failed to create private room for user {}: {}", user.getUsername(), e.getMessage());
                throw new RuntimeException("Failed to create private room", e);
            }
        });
    }

    /**
     * 创建群聊房间
     */
    public CompletableFuture<Map<String, Object>> createGroupRoom(User creator, String roomName, String roomTopic) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String matrixUserId = matrixHomeserver.buildMatrixUserId(creator.getUsername());
                
                String roomId = matrixHomeserver.createRoom(matrixUserId, roomName, roomTopic, false).join();
                
                logger.info("Created group room {} by user {}: {}", roomName, creator.getUsername(), roomId);
                
                return buildRoomInfo(roomId, roomName, "group");
                
            } catch (Exception e) {
                logger.error("Failed to create group room {}: {}", roomName, e.getMessage());
                throw new RuntimeException("Failed to create group room", e);
            }
        });
    }

    /**
     * 加入房间
     */
    public CompletableFuture<Boolean> joinRoom(User user, String roomId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String matrixUserId = matrixHomeserver.buildMatrixUserId(user.getUsername());
                
                boolean success = matrixHomeserver.joinRoom(matrixUserId, roomId).join();
                
                if (success) {
                    logger.info("User {} joined room: {}", user.getUsername(), roomId);
                } else {
                    logger.warn("Failed to join room {} for user {}", roomId, user.getUsername());
                }
                
                return success;
                
            } catch (Exception e) {
                logger.error("Error joining room {} for user {}: {}", roomId, user.getUsername(), e.getMessage());
                return false;
            }
        });
    }

    /**
     * 确保用户已登录到Matrix会话
     */
    public void ensureUserLoggedIn(String username) {
        try {
            String matrixUserId = matrixHomeserver.buildMatrixUserId(username);

            // 检查用户是否已经有活跃的Matrix会话
            if (!matrixHomeserver.isUserLoggedIn(matrixUserId)) {
                // 自动创建Matrix会话（简化版本）
                matrixHomeserver.createUserSession(matrixUserId);
                logger.info("Created Matrix session for user: {}", matrixUserId);

                // 自动加入世界频道
                String worldRoomId = getWorldChannel().join().get("id").toString();
                matrixHomeserver.joinRoom(matrixUserId, worldRoomId).join();
                logger.info("User {} joined world channel: {}", matrixUserId, worldRoomId);
            }
        } catch (Exception e) {
            logger.error("Failed to ensure user {} is logged in: {}", username, e.getMessage());
            throw new RuntimeException("Failed to log user into Matrix", e);
        }
    }

    /**
     * 发送消息到房间
     */
    public CompletableFuture<Map<String, Object>> sendMessage(User sender, String roomId, String message) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String matrixUserId = matrixHomeserver.buildMatrixUserId(sender.getUsername());
                
                String eventId = matrixHomeserver.sendMessage(matrixUserId, roomId, message).join();
                
                Map<String, Object> messageInfo = Map.of(
                    "id", eventId,
                    "roomId", roomId,
                    "content", message,
                    "sender", Map.of(
                        "id", sender.getId(),
                        "username", sender.getUsername(),
                        "displayName", sender.getDisplayName(),
                        "matrixUserId", matrixUserId
                    ),
                    "timestamp", System.currentTimeMillis(),
                    "type", "m.text"
                );
                
                logger.debug("Message sent to room {}: {}", roomId, eventId);
                return messageInfo;
                
            } catch (Exception e) {
                logger.error("Failed to send message to room {}: {}", roomId, e.getMessage());
                throw new RuntimeException("Failed to send message", e);
            }
        });
    }

    /**
     * 获取房间消息历史
     */
    public CompletableFuture<List<Map<String, Object>>> getRoomMessages(User user, String roomId, int limit) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String matrixUserId = matrixHomeserver.buildMatrixUserId(user.getUsername());

                List<MatrixEvent> events = matrixHomeserver.getRoomMessages(matrixUserId, roomId, limit).join();

                return events.stream()
                    .map(this::convertMatrixEventToMessage)
                    .toList();

            } catch (Exception e) {
                logger.error("Failed to get room messages for room {}: {}", roomId, e.getMessage());
                return List.of();
            }
        });
    }

    /**
     * 获取用户可访问的房间列表
     */
    public CompletableFuture<List<Map<String, Object>>> getUserRooms(User user) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String matrixUserId = matrixHomeserver.buildMatrixUserId(user.getUsername());
                MatrixUserSession session = matrixHomeserver.getUserSession(matrixUserId);

                if (session == null || !session.isActive()) {
                    logger.warn("User {} not logged in to Matrix", user.getUsername());
                    return List.of();
                }

                // 获取用户加入的房间
                List<Map<String, Object>> rooms = new java.util.ArrayList<>();

                // 世界频道
                rooms.add(Map.of(
                    "id", matrixHomeserver.getWorldRoomId(),
                    "name", "世界频道",
                    "type", "world",
                    "isPublic", true
                ));

                // 添加用户的私密房间
                String privateRoomId = userPrivateRooms.get(matrixUserId);
                if (privateRoomId != null) {
                    rooms.add(buildRoomInfo(privateRoomId, user.getDisplayName() + "的私密房间", "private"));
                }

                return rooms;

            } catch (Exception e) {
                logger.error("Failed to get user rooms for {}: {}", user.getUsername(), e.getMessage());
                return List.of();
            }
        });
    }

    /**
     * 获取用户的私密房间
     */
    public CompletableFuture<Map<String, Object>> getUserPrivateRoom(User user) {
        return CompletableFuture.supplyAsync(() -> {
            String matrixUserId = matrixHomeserver.buildMatrixUserId(user.getUsername());
            String roomId = userPrivateRooms.get(matrixUserId);
            
            if (roomId != null) {
                return buildRoomInfo(roomId, user.getDisplayName() + "的私密房间", "private");
            }
            
            return null;
        });
    }

    /**
     * 构建房间信息对象
     */
    private Map<String, Object> buildRoomInfo(String roomId, String roomName, String roomType) {
        return Map.of(
            "id", roomId,
            "name", roomName,
            "type", roomType,
            "memberCount", 1, // 简化实现
            "lastActivity", System.currentTimeMillis()
        );
    }

    /**
     * 将Matrix事件转换为消息对象
     */
    private Map<String, Object> convertMatrixEventToMessage(MatrixEvent event) {
        Map<String, Object> content = event.getContent();
        String messageBody = content != null ? (String) content.get("body") : "";

        return Map.of(
            "id", event.getEventId(),
            "content", messageBody,
            "sender", event.getSender(),
            "timestamp", event.getOriginServerTs(),
            "type", event.getType(),
            "roomId", event.getRoomId()
        );
    }
}
