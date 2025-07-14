package com.jianluochat.matrix;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

/**
 * Matrix Homeserver 核心服务
 * 基于Matrix协议概念的简化实现
 *
 * Matrix协议特色：
 * 1. 联邦化 - 支持跨服务器通信
 * 2. 事件驱动 - 所有操作都是事件
 * 3. 房间状态 - 分布式状态管理
 * 4. 用户ID格式 - @username:domain
 * 5. 房间ID格式 - !roomid:domain 或 #alias:domain
 */
@Service
public class MatrixHomeserver {

    private static final Logger logger = LoggerFactory.getLogger(MatrixHomeserver.class);

    @Value("${matrix.homeserver.url:https://matrix.jianluochat.com}")
    private String homeserverUrl;

    @Value("${matrix.homeserver.domain:jianluochat.com}")
    private String serverDomain;

    @Value("${matrix.world.room.alias:#world:jianluochat.com}")
    private String worldRoomAlias;

    // Matrix用户会话缓存 - 模拟Matrix客户端连接
    private final Map<String, MatrixUserSession> userSessions = new ConcurrentHashMap<>();

    // Matrix房间状态缓存 - 模拟分布式房间状态
    private final Map<String, MatrixRoomState> roomStates = new ConcurrentHashMap<>();

    // Matrix事件存储 - 模拟事件DAG
    private final Map<String, List<MatrixEvent>> roomEvents = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void initialize() {
        logger.info("Initializing Matrix Homeserver");
        logger.info("Homeserver URL: {}", homeserverUrl);
        logger.info("Server Domain: {}", serverDomain);
        logger.info("Matrix协议特色功能已启用：联邦化、事件驱动、分布式状态管理");

        // 初始化世界频道
        initializeWorldRoom();
    }

    /**
     * 用户注册到Matrix服务器
     * 体现Matrix协议的用户ID格式：@username:domain
     */
    public CompletableFuture<String> registerUser(String username, String password, String displayName) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 构造Matrix用户ID - Matrix协议标准格式
                String matrixUserId = "@" + username + ":" + serverDomain;

                logger.info("Registering Matrix user: {}", matrixUserId);

                // 生成访问令牌和设备ID
                String accessToken = "mda_" + UUID.randomUUID().toString().replace("-", "");
                String deviceId = "JIANLUOCHAT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

                // 创建用户会话
                MatrixUserSession session = new MatrixUserSession(matrixUserId, accessToken, deviceId);
                userSessions.put(matrixUserId, session);

                // 自动加入世界频道 - Matrix协议的房间自动加入机制
                session.joinRoom(worldRoomAlias);
                MatrixRoomState worldRoom = roomStates.get(worldRoomAlias);
                if (worldRoom != null) {
                    worldRoom.addMember(matrixUserId);

                    // 创建加入事件 - Matrix协议的事件驱动特性
                    MatrixEvent joinEvent = MatrixEvent.createMemberEvent(
                        worldRoomAlias, matrixUserId, matrixUserId, "join");
                    addEventToRoom(worldRoomAlias, joinEvent);
                }

                logger.info("Matrix user registered successfully: {} (device: {})", matrixUserId, deviceId);
                return matrixUserId;

            } catch (Exception e) {
                logger.error("Failed to register Matrix user: {}", e.getMessage());
                throw new RuntimeException("Matrix registration failed", e);
            }
        });
    }
    
    /**
     * 用户登录Matrix服务器
     * 返回用户会话而不是客户端对象
     */
    public CompletableFuture<MatrixUserSession> loginUser(String username, String password) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String matrixUserId = "@" + username + ":" + serverDomain;

                // 检查是否已有会话
                MatrixUserSession existingSession = userSessions.get(matrixUserId);
                if (existingSession != null && existingSession.isActive()) {
                    logger.info("Matrix user already logged in: {}", matrixUserId);
                    return existingSession;
                }

                // 创建新会话
                String accessToken = "mda_" + UUID.randomUUID().toString().replace("-", "");
                String deviceId = "JIANLUOCHAT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

                MatrixUserSession session = new MatrixUserSession(matrixUserId, accessToken, deviceId);
                userSessions.put(matrixUserId, session);

                logger.info("Matrix user logged in: {} (device: {})", matrixUserId, deviceId);
                return session;

            } catch (Exception e) {
                logger.error("Failed to login Matrix user: {}", e.getMessage());
                throw new RuntimeException("Matrix login failed", e);
            }
        });
    }
    
    /**
     * 创建Matrix房间
     * 体现Matrix协议的房间ID格式和状态管理
     */
    public CompletableFuture<String> createRoom(String creatorUserId, String roomName,
                                              String roomTopic, boolean isPublic) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                MatrixUserSession session = userSessions.get(creatorUserId);
                if (session == null || !session.isActive()) {
                    throw new RuntimeException("User not logged in to Matrix");
                }

                // 生成Matrix房间ID - 格式：!roomid:domain
                String roomId = "!" + UUID.randomUUID().toString().replace("-", "") + ":" + serverDomain;

                // 生成房间别名（如果是公开房间）
                String roomAlias = null;
                if (isPublic) {
                    String alias = roomName.toLowerCase().replaceAll("\\s+", "_").replaceAll("[^a-z0-9_]", "");
                    roomAlias = "#" + alias + ":" + serverDomain;
                }

                // 创建房间状态 - Matrix协议的分布式状态管理
                MatrixRoomState roomState = new MatrixRoomState(roomId, roomAlias, creatorUserId);
                roomState.setName(roomName);
                roomState.setTopic(roomTopic);
                roomState.setPublic(isPublic);

                // 存储房间状态
                roomStates.put(roomId, roomState);
                if (roomAlias != null) {
                    roomStates.put(roomAlias, roomState); // 别名也指向同一个状态
                }

                // 创建房间创建事件 - Matrix协议的事件驱动特性
                MatrixEvent createEvent = MatrixEvent.createRoomCreateEvent(roomId, creatorUserId);
                addEventToRoom(roomId, createEvent);

                // 创建者自动加入房间
                session.joinRoom(roomId);

                logger.info("Matrix room created: {} ({}) by {}", roomName, roomId, creatorUserId);
                if (roomAlias != null) {
                    logger.info("Room alias: {}", roomAlias);
                }

                return roomId;

            } catch (Exception e) {
                logger.error("Failed to create Matrix room: {}", e.getMessage());
                throw new RuntimeException("Matrix room creation failed", e);
            }
        });
    }
    
    /**
     * 加入Matrix房间
     * 体现Matrix协议的房间成员管理
     */
    public CompletableFuture<Boolean> joinRoom(String userId, String roomId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                MatrixUserSession session = userSessions.get(userId);
                if (session == null || !session.isActive()) {
                    throw new RuntimeException("User not logged in to Matrix");
                }

                MatrixRoomState roomState = roomStates.get(roomId);
                if (roomState == null) {
                    logger.warn("Room not found: {}", roomId);
                    return false;
                }

                // 检查是否已经是成员
                if (roomState.isMember(userId)) {
                    logger.info("User {} already in room: {}", userId, roomId);
                    return true;
                }

                // 加入房间
                roomState.addMember(userId);
                session.joinRoom(roomId);

                // 创建加入事件
                MatrixEvent joinEvent = MatrixEvent.createMemberEvent(roomId, userId, userId, "join");
                addEventToRoom(roomId, joinEvent);

                logger.info("User {} joined Matrix room: {}", userId, roomId);
                return true;

            } catch (Exception e) {
                logger.error("Failed to join Matrix room: {}", e.getMessage());
                return false;
            }
        });
    }
    
    /**
     * 检查用户是否已登录
     */
    public boolean isUserLoggedIn(String userId) {
        MatrixUserSession session = userSessions.get(userId);
        return session != null && session.isActive();
    }

    /**
     * 创建用户会话（简化版本）
     */
    public void createUserSession(String userId) {
        String accessToken = "mda_" + UUID.randomUUID().toString().replace("-", "");
        String deviceId = "JIANLUOCHAT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        MatrixUserSession session = new MatrixUserSession(userId, accessToken, deviceId);
        userSessions.put(userId, session);
        logger.info("Created Matrix session for user: {} (device: {})", userId, deviceId);
    }

    /**
     * 离开Matrix房间
     * 体现Matrix协议的房间成员管理
     */
    public CompletableFuture<Boolean> leaveRoom(String userId, String roomId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                MatrixUserSession session = userSessions.get(userId);
                if (session == null || !session.isActive()) {
                    throw new RuntimeException("User not logged in to Matrix");
                }

                MatrixRoomState roomState = roomStates.get(roomId);
                if (roomState == null) {
                    throw new RuntimeException("Room not found: " + roomId);
                }

                if (!roomState.isMember(userId)) {
                    logger.warn("User {} is not a member of room {}", userId, roomId);
                    return false;
                }

                // 从房间中移除用户
                roomState.removeMember(userId);

                logger.info("User {} left room {}", userId, roomId);
                return true;
            } catch (Exception e) {
                logger.error("Failed to leave room {} for user {}: {}", roomId, userId, e.getMessage());
                throw new RuntimeException("Failed to leave room", e);
            }
        });
    }

    /**
     * 发送Matrix消息
     * 体现Matrix协议的消息事件系统
     */
    public CompletableFuture<String> sendMessage(String userId, String roomId, String message) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                MatrixUserSession session = userSessions.get(userId);
                if (session == null || !session.isActive()) {
                    throw new RuntimeException("User not logged in to Matrix");
                }

                MatrixRoomState roomState = roomStates.get(roomId);
                if (roomState == null) {
                    throw new RuntimeException("Room not found: " + roomId);
                }

                if (!roomState.isMember(userId)) {
                    throw new RuntimeException("User not in room: " + roomId);
                }

                // 创建消息事件 - Matrix协议的消息格式
                MatrixEvent messageEvent = MatrixEvent.createMessageEvent(roomId, userId, "m.text", message);
                addEventToRoom(roomId, messageEvent);

                logger.debug("Matrix message sent: {} in room {}", messageEvent.getEventId(), roomId);
                return messageEvent.getEventId();

            } catch (Exception e) {
                logger.error("Failed to send Matrix message: {}", e.getMessage());
                throw new RuntimeException("Matrix message sending failed", e);
            }
        });
    }
    
    /**
     * 获取房间消息历史
     * 返回Matrix事件列表
     */
    public CompletableFuture<List<MatrixEvent>> getRoomMessages(String userId, String roomId, int limit) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                MatrixUserSession session = userSessions.get(userId);
                if (session == null || !session.isActive()) {
                    throw new RuntimeException("User not logged in to Matrix");
                }

                MatrixRoomState roomState = roomStates.get(roomId);
                if (roomState == null) {
                    throw new RuntimeException("Room not found: " + roomId);
                }

                if (!roomState.isMember(userId)) {
                    throw new RuntimeException("User not in room: " + roomId);
                }

                // 获取房间事件，过滤消息事件
                List<MatrixEvent> allEvents = roomEvents.getOrDefault(roomId, List.of());
                List<MatrixEvent> messageEvents = allEvents.stream()
                    .filter(MatrixEvent::isMessageEvent)
                    .sorted((e1, e2) -> e2.getTimestamp().compareTo(e1.getTimestamp())) // 最新的在前
                    .limit(limit)
                    .toList();

                logger.debug("Retrieved {} message events from room {}", messageEvents.size(), roomId);
                return messageEvents;

            } catch (Exception e) {
                logger.error("Failed to get Matrix room messages: {}", e.getMessage());
                return List.of();
            }
        });
    }
    
    /**
     * 初始化世界频道
     * 创建Matrix协议的公共房间
     */
    private void initializeWorldRoom() {
        try {
            logger.info("Initializing world room with alias: {}", worldRoomAlias);

            // 创建世界频道的房间状态
            MatrixRoomState worldRoom = new MatrixRoomState(worldRoomAlias, worldRoomAlias, "@system:" + serverDomain);
            worldRoom.setName("世界频道");
            worldRoom.setTopic("欢迎来到JianluoChat世界频道！这里是所有用户的公共聊天空间，体现Matrix协议的联邦化特性。");
            worldRoom.setPublic(true);

            // 存储世界频道状态
            roomStates.put(worldRoomAlias, worldRoom);

            // 创建房间创建事件
            MatrixEvent createEvent = MatrixEvent.createRoomCreateEvent(worldRoomAlias, "@system:" + serverDomain);
            addEventToRoom(worldRoomAlias, createEvent);

            logger.info("World room initialized successfully: {}", worldRoomAlias);
        } catch (Exception e) {
            logger.error("Failed to initialize world room: {}", e.getMessage());
        }
    }
    
    /**
     * 获取世界频道ID
     */
    public String getWorldRoomId() {
        return worldRoomAlias;
    }
    
    /**
     * 构造Matrix用户ID
     */
    public String buildMatrixUserId(String username) {
        return "@" + username + ":" + serverDomain;
    }

    /**
     * 添加事件到房间 - Matrix协议的事件存储
     */
    private void addEventToRoom(String roomId, MatrixEvent event) {
        roomEvents.computeIfAbsent(roomId, k -> new java.util.ArrayList<>()).add(event);
        logger.debug("Event added to room {}: {}", roomId, event.getType());
    }

    /**
     * 获取用户会话
     */
    public MatrixUserSession getUserSession(String userId) {
        return userSessions.get(userId);
    }

    /**
     * 获取房间状态
     */
    public MatrixRoomState getRoomState(String roomId) {
        return roomStates.get(roomId);
    }

    /**
     * 获取房间事件
     */
    public List<MatrixEvent> getRoomEvents(String roomId) {
        return roomEvents.getOrDefault(roomId, List.of());
    }
}
