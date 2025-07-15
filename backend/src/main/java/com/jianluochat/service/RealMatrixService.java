package com.jianluochat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jianluochat.entity.User;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 真正的Matrix协议客户端服务
 * 使用HTTP客户端直接实现Matrix协议通信
 *
 * 实现功能：
 * - 用户登录/注册
 * - 房间创建/加入
 * - 消息发送/接收
 * - 同步数据获取
 * - 世界频道管理
 */
@Service
public class RealMatrixService {

    private static final Logger logger = LoggerFactory.getLogger(RealMatrixService.class);

    @Value("${matrix.homeserver.url:https://matrix.org}")
    private String homeserverUrl;

    @Value("${matrix.world.room.alias:#jianluochat-world:matrix.org}")
    private String worldRoomAlias;

    // 支持的Matrix服务器列表
    private final Map<String, String> supportedServers = Map.of(
        "matrix.org", "https://matrix.org",
        "kde.org", "https://matrix.kde.org",
        "mozilla.org", "https://chat.mozilla.org"
    );

    // HTTP客户端
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
        .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .build();

    // JSON处理器
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 用户访问令牌缓存
    private final Map<String, String> userTokens = new ConcurrentHashMap<>();

    // 用户设备ID缓存
    private final Map<String, String> userDeviceIds = new ConcurrentHashMap<>();

    // 公共访问方法
    public String getAccessToken(String username) {
        return userTokens.get(username);
    }

    public OkHttpClient getHttpClient() {
        return httpClient;
    }

    public ObjectMapper getObjectMapper() {
        return objectMapper;
    }

    public String getHomeserverUrl() {
        return homeserverUrl;
    }

    // 世界频道房间ID
    private String worldRoomId;

    @PostConstruct
    public void initialize() {
        logger.info("Initializing Real Matrix Service");
        logger.info("Homeserver URL: {}", homeserverUrl);
        logger.info("World Room Alias: {}", worldRoomAlias);
        
        // 初始化世界频道
        initializeWorldChannel();
    }

    /**
     * 用户登录到Matrix
     */
    public CompletableFuture<String> loginUser(User user, String password) {
        return loginUser(user, password, "matrix.org");
    }

    /**
     * 用户登录到指定Matrix服务器
     */
    public CompletableFuture<String> loginUser(User user, String password, String homeserver) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 获取服务器URL
                String serverUrl = supportedServers.getOrDefault(homeserver, "https://" + homeserver);

                // 构建登录请求
                Map<String, Object> loginData = new HashMap<>();
                loginData.put("type", "m.login.password");
                loginData.put("user", user.getUsername());
                loginData.put("password", password);

                String jsonBody = objectMapper.writeValueAsString(loginData);

                RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.get("application/json; charset=utf-8")
                );

                Request request = new Request.Builder()
                    .url(serverUrl + "/_matrix/client/r0/login")
                    .post(body)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                        logger.error("Matrix login failed for user {}: {} - {}", user.getUsername(), response.code(), errorBody);
                        throw new RuntimeException("Matrix login failed: " + response.code());
                    }

                    String responseBody = response.body().string();
                    JsonNode jsonResponse = objectMapper.readTree(responseBody);
                    String accessToken = jsonResponse.get("access_token").asText();
                    String deviceId = jsonResponse.has("device_id") ? jsonResponse.get("device_id").asText() : null;

                    // 缓存访问令牌和设备ID
                    userTokens.put(user.getUsername(), accessToken);
                    if (deviceId != null) {
                        userDeviceIds.put(user.getUsername(), deviceId);
                    }

                    logger.info("User {} logged into Matrix successfully with device {}", user.getUsername(), deviceId);
                    return accessToken;
                }

            } catch (Exception e) {
                logger.error("Failed to login user {} to Matrix: {}", user.getUsername(), e.getMessage());
                throw new RuntimeException("Matrix login failed", e);
            }
        });
    }

    /**
     * 用户注册到Matrix
     */
    public CompletableFuture<String> registerUser(User user, String password) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 简化处理：直接尝试登录，如果失败则表示需要注册
                logger.warn("Matrix registration not fully implemented, using login instead");
                return loginUser(user, password).join();

            } catch (Exception e) {
                logger.error("Failed to register user {} to Matrix: {}", user.getUsername(), e.getMessage());
                throw new RuntimeException("Matrix registration failed", e);
            }
        });
    }

    /**
     * 发送消息到房间
     */
    public CompletableFuture<String> sendMessage(User user, String roomId, String message) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String accessToken = userTokens.get(user.getUsername());
                if (accessToken == null) {
                    throw new RuntimeException("User not logged into Matrix");
                }

                // 构建消息数据
                Map<String, Object> messageData = new HashMap<>();
                messageData.put("msgtype", "m.text");
                messageData.put("body", message);

                String jsonBody = objectMapper.writeValueAsString(messageData);

                RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.get("application/json; charset=utf-8")
                );

                // 生成事务ID
                String txnId = "txn" + System.currentTimeMillis();

                Request request = new Request.Builder()
                    .url(homeserverUrl + "/_matrix/client/r0/rooms/" + roomId + "/send/m.room.message/" + txnId)
                    .put(body)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new RuntimeException("Failed to send message: " + response.code());
                    }

                    String responseBody = response.body().string();
                    JsonNode jsonResponse = objectMapper.readTree(responseBody);
                    String eventId = jsonResponse.get("event_id").asText();

                    logger.info("Message sent to room {} by user {}: {}", roomId, user.getUsername(), eventId);
                    return eventId;
                }

            } catch (Exception e) {
                logger.error("Failed to send message to room {} by user {}: {}", roomId, user.getUsername(), e.getMessage());
                throw new RuntimeException("Failed to send Matrix message", e);
            }
        });
    }

    /**
     * 加入房间
     */
    public CompletableFuture<Void> joinRoom(User user, String roomId) {
        return CompletableFuture.runAsync(() -> {
            try {
                String accessToken = userTokens.get(user.getUsername());
                if (accessToken == null) {
                    throw new RuntimeException("User not logged into Matrix");
                }

                RequestBody body = RequestBody.create(
                    "{}",
                    MediaType.get("application/json; charset=utf-8")
                );

                Request request = new Request.Builder()
                    .url(homeserverUrl + "/_matrix/client/r0/rooms/" + roomId + "/join")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new RuntimeException("Failed to join room: " + response.code());
                    }

                    logger.info("User {} joined Matrix room: {}", user.getUsername(), roomId);
                }

            } catch (Exception e) {
                logger.error("Failed to join room {} for user {}: {}", roomId, user.getUsername(), e.getMessage());
                throw new RuntimeException("Failed to join Matrix room", e);
            }
        });
    }

    /**
     * 创建房间
     */
    public CompletableFuture<String> createRoom(User user, String roomName, boolean isPublic) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String accessToken = userTokens.get(user.getUsername());
                if (accessToken == null) {
                    throw new RuntimeException("User not logged into Matrix");
                }

                // 构建房间创建数据
                Map<String, Object> roomData = new HashMap<>();
                roomData.put("name", roomName);
                roomData.put("preset", isPublic ? "public_chat" : "private_chat");
                roomData.put("visibility", isPublic ? "public" : "private");

                String jsonBody = objectMapper.writeValueAsString(roomData);

                RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.get("application/json; charset=utf-8")
                );

                Request request = new Request.Builder()
                    .url(homeserverUrl + "/_matrix/client/r0/createRoom")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new RuntimeException("Failed to create room: " + response.code());
                    }

                    String responseBody = response.body().string();
                    JsonNode jsonResponse = objectMapper.readTree(responseBody);
                    String roomId = jsonResponse.get("room_id").asText();

                    logger.info("Room created by user {}: {} ({})", user.getUsername(), roomId, roomName);
                    return roomId;
                }

            } catch (Exception e) {
                logger.error("Failed to create room for user {}: {}", user.getUsername(), e.getMessage());
                throw new RuntimeException("Failed to create Matrix room", e);
            }
        });
    }

    /**
     * 获取世界频道信息
     */
    public CompletableFuture<Map<String, Object>> getWorldChannel() {
        return CompletableFuture.supplyAsync(() -> {
            Map<String, Object> worldChannel = new HashMap<>();
            worldChannel.put("id", worldRoomId != null ? worldRoomId : worldRoomAlias);
            worldChannel.put("name", "世界频道");
            worldChannel.put("type", "world");
            worldChannel.put("alias", worldRoomAlias);
            worldChannel.put("isPublic", true);
            worldChannel.put("memberCount", 0); // 需要实际查询
            worldChannel.put("topic", "欢迎来到JianluoChat世界频道！这里是所有用户的公共聊天空间。");
            
            return worldChannel;
        });
    }

    /**
     * 获取用户房间列表
     */
    public CompletableFuture<List<Map<String, Object>>> getUserRooms(User user) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String accessToken = userTokens.get(user.getUsername());
                if (accessToken == null) {
                    logger.warn("User {} not logged into Matrix", user.getUsername());
                    return List.of();
                }

                // 调用Matrix同步API获取房间列表
                Request request = new Request.Builder()
                    .url(homeserverUrl + "/_matrix/client/r0/sync?timeout=0")
                    .get()
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        logger.error("Failed to sync for user {}: {}", user.getUsername(), response.code());
                        return List.of();
                    }

                    String responseBody = response.body().string();
                    JsonNode syncData = objectMapper.readTree(responseBody);

                    List<Map<String, Object>> rooms = new ArrayList<>();

                    // 添加世界频道
                    rooms.add(getWorldChannel().join());

                    // 处理已加入的房间
                    JsonNode joinedRooms = syncData.path("rooms").path("join");
                    if (joinedRooms.isObject()) {
                        joinedRooms.fields().forEachRemaining(entry -> {
                            String roomId = entry.getKey();
                            JsonNode roomData = entry.getValue();

                            Map<String, Object> roomInfo = new HashMap<>();
                            roomInfo.put("id", roomId);
                            roomInfo.put("type", "matrix");

                            // 获取房间名称
                            String roomName = extractRoomNameFromJson(roomData);
                            roomInfo.put("name", roomName != null ? roomName : roomId);

                            roomInfo.put("members", new ArrayList<>());
                            roomInfo.put("memberCount", 0);
                            roomInfo.put("unreadCount", 0);
                            rooms.add(roomInfo);
                        });
                    }

                    logger.info("Retrieved {} rooms for user {}", rooms.size(), user.getUsername());
                    return rooms;
                }

            } catch (Exception e) {
                logger.error("Failed to get user rooms for {}: {}", user.getUsername(), e.getMessage());
                return List.of();
            }
        });
    }

    /**
     * 初始化世界频道
     */
    private void initializeWorldChannel() {
        try {
            // 这里需要一个管理员账户来创建/管理世界频道
            // 简化处理，直接使用别名作为房间ID
            worldRoomId = worldRoomAlias;
            logger.info("World channel initialized: {}", worldRoomId);
        } catch (Exception e) {
            logger.error("Failed to initialize world channel: {}", e.getMessage());
        }
    }

    /**
     * 从房间数据中提取房间名称
     */
    private String extractRoomNameFromJson(JsonNode roomData) {
        try {
            JsonNode stateEvents = roomData.path("state").path("events");
            if (stateEvents.isArray()) {
                for (JsonNode event : stateEvents) {
                    if ("m.room.name".equals(event.path("type").asText())) {
                        String roomName = event.path("content").path("name").asText();
                        if (!roomName.isEmpty()) {
                            return roomName;
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to extract room name: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 检查用户是否已登录Matrix
     */
    public boolean isUserLoggedIn(String username) {
        return userTokens.containsKey(username);
    }

    /**
     * 离开房间
     */
    public CompletableFuture<Void> leaveRoom(User user, String roomId) {
        return CompletableFuture.runAsync(() -> {
            try {
                String accessToken = userTokens.get(user.getUsername());
                if (accessToken == null) {
                    throw new RuntimeException("User not logged into Matrix");
                }

                RequestBody body = RequestBody.create(
                    "{}",
                    MediaType.get("application/json; charset=utf-8")
                );

                Request request = new Request.Builder()
                    .url(homeserverUrl + "/_matrix/client/r0/rooms/" + roomId + "/leave")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new RuntimeException("Failed to leave room: " + response.code());
                    }

                    logger.info("User {} left Matrix room: {}", user.getUsername(), roomId);
                }

            } catch (Exception e) {
                logger.error("Failed to leave room {} for user {}: {}", roomId, user.getUsername(), e.getMessage());
                throw new RuntimeException("Failed to leave Matrix room", e);
            }
        });
    }

    /**
     * 获取房间消息历史
     */
    public CompletableFuture<List<Map<String, Object>>> getRoomMessages(User user, String roomId, int limit) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String accessToken = userTokens.get(user.getUsername());
                if (accessToken == null) {
                    throw new RuntimeException("User not logged into Matrix");
                }

                // 调用Matrix房间消息API
                String url = homeserverUrl + "/_matrix/client/r0/rooms/" + roomId + "/messages?limit=" + limit + "&dir=b";

                Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new RuntimeException("Failed to get messages: " + response.code());
                    }

                    String responseBody = response.body().string();
                    JsonNode messagesData = objectMapper.readTree(responseBody);

                    List<Map<String, Object>> messages = new ArrayList<>();
                    JsonNode events = messagesData.path("chunk");

                    if (events.isArray()) {
                        for (JsonNode event : events) {
                            if ("m.room.message".equals(event.path("type").asText())) {
                                Map<String, Object> messageInfo = new HashMap<>();
                                messageInfo.put("id", event.path("event_id").asText());
                                messageInfo.put("roomId", roomId);
                                messageInfo.put("content", event.path("content").path("body").asText());
                                messageInfo.put("sender", event.path("sender").asText());
                                messageInfo.put("timestamp", event.path("origin_server_ts").asLong());
                                messageInfo.put("type", "m.text");
                                messages.add(messageInfo);
                            }
                        }
                    }

                    logger.info("Retrieved {} messages for room {}", messages.size(), roomId);
                    return messages;
                }

            } catch (Exception e) {
                logger.error("Failed to get messages for room {}: {}", roomId, e.getMessage());
                throw new RuntimeException("Failed to get Matrix messages", e);
            }
        });
    }

    /**
     * Matrix同步 - 获取最新事件
     */
    public CompletableFuture<Map<String, Object>> syncMatrix(User user, String since) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String accessToken = userTokens.get(user.getUsername());
                if (accessToken == null) {
                    throw new RuntimeException("User not logged into Matrix");
                }

                // 构建同步URL
                String url = homeserverUrl + "/_matrix/client/r0/sync?timeout=30000";
                if (since != null && !since.isEmpty()) {
                    url += "&since=" + since;
                }

                Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new RuntimeException("Failed to sync: " + response.code());
                    }

                    String responseBody = response.body().string();
                    JsonNode syncData = objectMapper.readTree(responseBody);

                    Map<String, Object> result = new HashMap<>();
                    result.put("nextBatch", syncData.path("next_batch").asText());

                    // 处理房间事件
                    List<Map<String, Object>> roomEvents = new ArrayList<>();
                    JsonNode joinedRooms = syncData.path("rooms").path("join");

                    if (joinedRooms.isObject()) {
                        joinedRooms.fields().forEachRemaining(entry -> {
                            String roomId = entry.getKey();
                            JsonNode roomData = entry.getValue();

                            // 处理时间线事件（新消息）
                            JsonNode timelineEvents = roomData.path("timeline").path("events");
                            if (timelineEvents.isArray()) {
                                for (JsonNode event : timelineEvents) {
                                    if ("m.room.message".equals(event.path("type").asText())) {
                                        Map<String, Object> messageEvent = new HashMap<>();
                                        messageEvent.put("roomId", roomId);
                                        messageEvent.put("eventId", event.path("event_id").asText());
                                        messageEvent.put("sender", event.path("sender").asText());
                                        messageEvent.put("content", event.path("content").path("body").asText());
                                        messageEvent.put("timestamp", event.path("origin_server_ts").asLong());
                                        messageEvent.put("type", "message");
                                        roomEvents.add(messageEvent);
                                    }
                                }
                            }
                        });
                    }

                    result.put("events", roomEvents);
                    logger.info("Matrix sync completed for user {}, {} events", user.getUsername(), roomEvents.size());
                    return result;
                }

            } catch (Exception e) {
                logger.error("Failed to sync Matrix for user {}: {}", user.getUsername(), e.getMessage());
                throw new RuntimeException("Matrix sync failed", e);
            }
        });
    }

    /**
     * 用户登出Matrix
     */
    public void logoutUser(String username) {
        String accessToken = userTokens.remove(username);
        userDeviceIds.remove(username);

        if (accessToken != null) {
            try {
                // 调用Matrix登出API
                RequestBody body = RequestBody.create(
                    "{}",
                    MediaType.get("application/json; charset=utf-8")
                );

                Request request = new Request.Builder()
                    .url(homeserverUrl + "/_matrix/client/r0/logout")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        logger.info("User {} logged out from Matrix successfully", username);
                    } else {
                        logger.warn("Failed to logout user {} from Matrix: {}", username, response.code());
                    }
                }
            } catch (Exception e) {
                logger.error("Error during logout for user {}: {}", username, e.getMessage());
            }
        }
    }
}
