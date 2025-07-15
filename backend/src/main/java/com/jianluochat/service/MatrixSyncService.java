package com.jianluochat.service;

import com.jianluochat.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Matrix同步服务
 * 负责处理Matrix协议的实时同步和事件分发
 */
@Service
public class MatrixSyncService {

    private static final Logger logger = LoggerFactory.getLogger(MatrixSyncService.class);

    @Autowired
    private RealMatrixService realMatrixService;

    // 用户同步状态缓存
    private final Map<String, String> userSyncTokens = new ConcurrentHashMap<>();
    
    // 用户WebSocket会话缓存
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    
    // 同步任务执行器
    private final ScheduledExecutorService syncExecutor = Executors.newScheduledThreadPool(10);

    /**
     * 开始为用户进行Matrix同步
     */
    public void startSyncForUser(User user, WebSocketSession session) {
        String username = user.getUsername();
        
        // 缓存WebSocket会话
        userSessions.put(username, session);
        
        logger.info("Starting Matrix sync for user: {}", username);
        
        // 启动同步任务
        syncExecutor.scheduleWithFixedDelay(() -> {
            try {
                if (!userSessions.containsKey(username)) {
                    logger.info("User {} session closed, stopping sync", username);
                    return;
                }
                
                String since = userSyncTokens.get(username);
                Map<String, Object> syncResult = realMatrixService.syncMatrix(user, since).join();
                
                // 更新同步令牌
                String nextBatch = (String) syncResult.get("nextBatch");
                if (nextBatch != null) {
                    userSyncTokens.put(username, nextBatch);
                }
                
                // 处理同步事件
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> events = (java.util.List<Map<String, Object>>) syncResult.get("events");
                
                if (events != null && !events.isEmpty()) {
                    // 发送事件到WebSocket客户端
                    sendEventsToClient(username, events);
                }
                
            } catch (Exception e) {
                logger.error("Matrix sync error for user {}: {}", username, e.getMessage());
                // 如果同步失败，稍后重试
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }, 0, 1, TimeUnit.SECONDS);
    }

    /**
     * 停止用户的Matrix同步
     */
    public void stopSyncForUser(String username) {
        userSessions.remove(username);
        userSyncTokens.remove(username);
        logger.info("Stopped Matrix sync for user: {}", username);
    }

    /**
     * 发送事件到WebSocket客户端
     */
    private void sendEventsToClient(String username, java.util.List<Map<String, Object>> events) {
        WebSocketSession session = userSessions.get(username);
        if (session == null || !session.isOpen()) {
            logger.warn("WebSocket session not available for user: {}", username);
            return;
        }

        try {
            for (Map<String, Object> event : events) {
                // 构建WebSocket消息
                Map<String, Object> wsMessage = new ConcurrentHashMap<>();
                wsMessage.put("type", "matrix_event");
                wsMessage.put("event", event);
                wsMessage.put("timestamp", System.currentTimeMillis());

                // 发送到WebSocket
                String jsonMessage = realMatrixService.getObjectMapper().writeValueAsString(wsMessage);
                session.sendMessage(new org.springframework.web.socket.TextMessage(jsonMessage));

                logger.debug("Sent Matrix event to user {}: {}", username, event.get("type"));
            }
        } catch (Exception e) {
            logger.error("Failed to send events to user {}: {}", username, e.getMessage());
        }
    }

    /**
     * 获取用户的同步状态
     */
    public Map<String, Object> getUserSyncStatus(String username) {
        Map<String, Object> status = new ConcurrentHashMap<>();
        status.put("username", username);
        status.put("isActive", userSessions.containsKey(username));
        status.put("syncToken", userSyncTokens.get(username));
        status.put("sessionOpen", userSessions.containsKey(username) && userSessions.get(username).isOpen());
        return status;
    }

    /**
     * 手动触发用户同步
     */
    public CompletableFuture<Map<String, Object>> triggerSyncForUser(User user) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String since = userSyncTokens.get(user.getUsername());
                Map<String, Object> syncResult = realMatrixService.syncMatrix(user, since).join();
                
                // 更新同步令牌
                String nextBatch = (String) syncResult.get("nextBatch");
                if (nextBatch != null) {
                    userSyncTokens.put(user.getUsername(), nextBatch);
                }
                
                return syncResult;
            } catch (Exception e) {
                logger.error("Manual sync failed for user {}: {}", user.getUsername(), e.getMessage());
                throw new RuntimeException("Manual sync failed", e);
            }
        });
    }

    /**
     * 清理资源
     */
    public void shutdown() {
        syncExecutor.shutdown();
        try {
            if (!syncExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                syncExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            syncExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        logger.info("Matrix sync service shutdown completed");
    }
}
