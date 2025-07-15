package com.jianluochat.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jianluochat.entity.Message;
import com.jianluochat.entity.Room;
import com.jianluochat.entity.User;
import com.jianluochat.repository.UserRepository;
import com.jianluochat.service.MessageService;
import com.jianluochat.service.RoomService;
import com.jianluochat.service.MatrixRoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler implements org.springframework.web.socket.WebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandler.class);
    
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> userRooms = new ConcurrentHashMap<>(); // userId -> roomCode
    private final ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomService roomService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private MatrixRoomService matrixRoomService;

    public WebSocketHandler() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.put(userId, session);
            logger.info("WebSocket connection established for user: {}", userId);

            // 自动登录用户到Matrix会话
            try {
                matrixRoomService.ensureUserLoggedIn(userId);
                logger.info("User {} logged into Matrix session", userId);
            } catch (Exception e) {
                logger.warn("Failed to log user {} into Matrix: {}", userId, e.getMessage());
            }

            // Send welcome message
            sendMessage(session, new WebSocketMessage("CONNECTED", "Welcome to JianluoChat!", null));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, org.springframework.web.socket.WebSocketMessage<?> message) throws Exception {
        String userId = getUserIdFromSession(session);
        logger.info("Received message from user {}: {}", userId, message);

        if (message instanceof org.springframework.web.socket.TextMessage) {
            org.springframework.web.socket.TextMessage textMessage = (org.springframework.web.socket.TextMessage) message;
            try {
                WebSocketMessage<?> wsMessage = objectMapper.readValue(textMessage.getPayload(), WebSocketMessage.class);
                processMessage(session, userId, wsMessage);
            } catch (Exception e) {
                logger.error("Error processing message: {}", e.getMessage());
                sendErrorMessage(session, "Invalid message format");
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String userId = getUserIdFromSession(session);
        logger.error("WebSocket transport error for user {}: {}", userId, exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.remove(userId);
            logger.info("WebSocket connection closed for user: {}, status: {}", userId, closeStatus);
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    private void processMessage(WebSocketSession session, String userId, WebSocketMessage<?> message) {
        switch (message.getType()) {
            case "PING":
                sendMessage(session, new WebSocketMessage<>("PONG", "pong", null));
                break;
            case "JOIN_ROOM":
                handleJoinRoom(session, userId, message);
                break;
            case "LEAVE_ROOM":
                handleLeaveRoom(session, userId, message);
                break;
            case "CHAT_MESSAGE":
                handleChatMessage(session, userId, message);
                break;
            case "WORLD_MESSAGE":
                handleWorldMessage(session, userId, message);
                break;
            case "JOIN_WORLD":
                handleJoinWorld(session, userId);
                break;
            case "TYPING":
                handleTypingIndicator(userId, message);
                break;
            default:
                logger.warn("Unknown message type: {}", message.getType());
        }
    }

    private void handleJoinRoom(WebSocketSession session, String userId, WebSocketMessage<?> message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) message.getData();
            String roomCode = (String) data.get("roomCode");

            if (roomCode == null) {
                sendErrorMessage(session, "房间码不能为空");
                return;
            }

            // 记录用户当前所在房间
            userRooms.put(userId, roomCode);

            // 发送确认消息
            sendMessage(session, new WebSocketMessage<>("ROOM_JOINED", "成功加入房间", Map.of("roomCode", roomCode)));

            logger.info("User {} joined room {}", userId, roomCode);
        } catch (Exception e) {
            logger.error("Error handling join room: {}", e.getMessage());
            sendErrorMessage(session, "加入房间失败");
        }
    }

    private void handleLeaveRoom(WebSocketSession session, String userId, WebSocketMessage<?> message) {
        try {
            String currentRoom = userRooms.remove(userId);
            if (currentRoom != null) {
                sendMessage(session, new WebSocketMessage<>("ROOM_LEFT", "已离开房间", Map.of("roomCode", currentRoom)));
                logger.info("User {} left room {}", userId, currentRoom);
            }
        } catch (Exception e) {
            logger.error("Error handling leave room: {}", e.getMessage());
            sendErrorMessage(session, "离开房间失败");
        }
    }

    private void handleChatMessage(WebSocketSession session, String userId, WebSocketMessage<?> message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) message.getData();
            String roomCode = (String) data.get("roomCode");
            String roomId = (String) data.get("roomId");
            String content = (String) data.get("content");
            String messageType = (String) data.get("messageType");

            // 支持roomCode（传统房间）或roomId（Matrix房间）
            String targetRoomIdentifier = roomCode != null ? roomCode : roomId;

            if (targetRoomIdentifier == null || content == null || content.trim().isEmpty()) {
                sendErrorMessage(session, "房间标识和消息内容不能为空");
                return;
            }

            // 如果是Matrix房间ID（以!开头），直接通过Matrix发送
            if (targetRoomIdentifier.startsWith("!")) {
                handleMatrixRoomMessage(session, userId, targetRoomIdentifier, content);
                return;
            }

            // 查找传统房间
            Room room = roomService.findByRoomCode(targetRoomIdentifier).orElse(null);
            if (room == null) {
                sendErrorMessage(session, "房间不存在");
                return;
            }

            // 查找用户
            User user = userRepository.findById(Long.parseLong(userId)).orElse(null);
            if (user == null) {
                sendErrorMessage(session, "用户不存在");
                return;
            }

            // 发送消息
            Message.MessageType type = Message.MessageType.TEXT;
            if (messageType != null) {
                try {
                    type = Message.MessageType.valueOf(messageType.toUpperCase());
                } catch (IllegalArgumentException e) {
                    // 使用默认类型
                }
            }

            Message savedMessage = messageService.sendMessage(room, user, content, type);

            // 广播消息给房间内的所有用户
            Map<String, Object> messageData = formatMessageForBroadcast(savedMessage);
            broadcastToRoom(roomCode, new WebSocketMessage<>("NEW_MESSAGE", "新消息", messageData));

            logger.info("Message sent in room {} by user {}", targetRoomIdentifier, userId);
        } catch (Exception e) {
            logger.error("Error handling chat message: {}", e.getMessage());
            sendErrorMessage(session, "发送消息失败: " + e.getMessage());
        }
    }

    /**
     * 处理Matrix房间消息
     */
    private void handleMatrixRoomMessage(WebSocketSession session, String userId, String roomId, String content) {
        try {
            User user = userRepository.findById(Long.parseLong(userId)).orElse(null);
            if (user == null) {
                sendErrorMessage(session, "用户不存在");
                return;
            }

            // 通过MatrixRoomService发送消息
            Map<String, Object> messageResult = matrixRoomService.sendMessage(user, roomId, content).join();

            // 广播消息给房间内的所有用户（这里简化处理，广播给所有用户）
            broadcastToAllUsers(new WebSocketMessage<>("NEW_MESSAGE", "新消息", messageResult));

            logger.info("Matrix message sent in room {} by user {}", roomId, userId);
        } catch (Exception e) {
            logger.error("Error handling Matrix room message: {}", e.getMessage());
            sendErrorMessage(session, "发送Matrix房间消息失败: " + e.getMessage());
        }
    }

    private void handleWorldMessage(WebSocketSession session, String userId, WebSocketMessage<?> message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) message.getData();
            String content = (String) data.get("content");

            if (content == null || content.trim().isEmpty()) {
                sendErrorMessage(session, "消息内容不能为空");
                return;
            }

            // 获取用户信息（userId是用户名，不是ID）
            User user = userRepository.findByUsername(userId).orElse(null);
            if (user == null) {
                sendErrorMessage(session, "用户不存在");
                return;
            }

            // 通过MatrixRoomService发送到世界频道
            String worldRoomId = matrixRoomService.getWorldChannel().join().get("id").toString();
            Map<String, Object> messageResult = matrixRoomService.sendMessage(user, worldRoomId, content).join();

            // 广播消息给所有连接的用户
            broadcastToAllUsers(new WebSocketMessage<>("WORLD_MESSAGE", "世界频道消息", messageResult));

            logger.info("World message sent by user {}: {}", userId, content);
        } catch (Exception e) {
            logger.error("Error handling world message: {}", e.getMessage());
            sendErrorMessage(session, "发送世界频道消息失败: " + e.getMessage());
        }
    }

    private void handleJoinWorld(WebSocketSession session, String userId) {
        try {
            // 标记用户加入世界频道
            userRooms.put(userId, "WORLD");

            // 发送确认消息
            sendMessage(session, new WebSocketMessage<>("WORLD_JOINED", "成功加入世界频道", Map.of("channel", "world")));

            logger.info("User {} joined world channel", userId);
        } catch (Exception e) {
            logger.error("Error handling join world: {}", e.getMessage());
            sendErrorMessage(session, "加入世界频道失败");
        }
    }

    private void handleTypingIndicator(String userId, WebSocketMessage<?> message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) message.getData();
            String roomCode = (String) data.get("roomCode");
            Boolean isTyping = (Boolean) data.get("isTyping");

            if (roomCode != null) {
                // 广播输入状态给房间内的其他用户
                Map<String, Object> typingData = Map.of(
                    "userId", userId,
                    "roomCode", roomCode,
                    "isTyping", isTyping != null ? isTyping : false
                );

                broadcastToRoomExceptSender(roomCode, userId,
                    new WebSocketMessage<>("TYPING_INDICATOR", "输入状态", typingData));

                logger.debug("Typing indicator from user {} in room {}: {}", userId, roomCode, isTyping);
            }
        } catch (Exception e) {
            logger.error("Error handling typing indicator: {}", e.getMessage());
        }
    }

    private String getUserIdFromSession(WebSocketSession session) {
        return (String) session.getAttributes().get("userId");
    }

    public void sendMessage(WebSocketSession session, WebSocketMessage<?> message) {
        try {
            if (session.isOpen()) {
                String jsonMessage = objectMapper.writeValueAsString(message);
                session.sendMessage(new org.springframework.web.socket.TextMessage(jsonMessage));
            }
        } catch (IOException e) {
            logger.error("Error sending message: {}", e.getMessage());
        }
    }

    public void sendMessageToUser(String userId, WebSocketMessage<?> message) {
        WebSocketSession session = sessions.get(userId);
        if (session != null) {
            sendMessage(session, message);
        }
    }

    private void sendErrorMessage(WebSocketSession session, String error) {
        sendMessage(session, new WebSocketMessage<>("ERROR", error, null));
    }

    public boolean isUserOnline(String userId) {
        return sessions.containsKey(userId);
    }

    public int getOnlineUserCount() {
        return sessions.size();
    }

    /**
     * 广播消息给房间内的所有用户
     */
    private void broadcastToRoom(String roomCode, WebSocketMessage<?> message) {
        for (Map.Entry<String, String> entry : userRooms.entrySet()) {
            if (roomCode.equals(entry.getValue())) {
                String userId = entry.getKey();
                WebSocketSession session = sessions.get(userId);
                if (session != null && session.isOpen()) {
                    sendMessage(session, message);
                }
            }
        }
    }

    /**
     * 广播消息给房间内除发送者外的所有用户
     */
    private void broadcastToRoomExceptSender(String roomCode, String senderId, WebSocketMessage<?> message) {
        for (Map.Entry<String, String> entry : userRooms.entrySet()) {
            if (roomCode.equals(entry.getValue()) && !senderId.equals(entry.getKey())) {
                String userId = entry.getKey();
                WebSocketSession session = sessions.get(userId);
                if (session != null && session.isOpen()) {
                    sendMessage(session, message);
                }
            }
        }
    }

    /**
     * 广播消息给所有连接的用户
     */
    private void broadcastToAllUsers(WebSocketMessage<?> message) {
        for (WebSocketSession session : sessions.values()) {
            if (session != null && session.isOpen()) {
                sendMessage(session, message);
            }
        }
    }

    /**
     * 广播消息给除发送者外的所有用户
     */
    private void broadcastToAllUsersExceptSender(String senderId, WebSocketMessage<?> message) {
        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (!senderId.equals(entry.getKey())) {
                WebSocketSession session = entry.getValue();
                if (session != null && session.isOpen()) {
                    sendMessage(session, message);
                }
            }
        }
    }

    /**
     * 格式化消息用于广播
     */
    private Map<String, Object> formatMessageForBroadcast(Message message) {
        return Map.of(
            "id", message.getId(),
            "content", message.getContent(),
            "type", message.getType().toString(),
            "roomCode", message.getRoom().getRoomCode(),
            "sender", Map.of(
                "id", message.getSender().getId(),
                "username", message.getSender().getUsername(),
                "displayName", message.getSender().getDisplayName(),
                "avatarUrl", message.getSender().getAvatarUrl() != null ? message.getSender().getAvatarUrl() : ""
            ),
            "timestamp", message.getCreatedAt()
        );
    }
}
