package com.jianluochat.matrix;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Matrix用户会话
 * 模拟Matrix协议中的用户连接状态
 */
public class MatrixUserSession {
    
    private final String userId;
    private final String accessToken;
    private final String deviceId;
    private final LocalDateTime loginTime;
    private final Set<String> joinedRooms;
    private boolean isActive;
    
    public MatrixUserSession(String userId, String accessToken, String deviceId) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.deviceId = deviceId;
        this.loginTime = LocalDateTime.now();
        this.joinedRooms = ConcurrentHashMap.newKeySet();
        this.isActive = true;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public String getDeviceId() {
        return deviceId;
    }
    
    public LocalDateTime getLoginTime() {
        return loginTime;
    }
    
    public Set<String> getJoinedRooms() {
        return joinedRooms;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public void joinRoom(String roomId) {
        joinedRooms.add(roomId);
    }
    
    public void leaveRoom(String roomId) {
        joinedRooms.remove(roomId);
    }
    
    public boolean isInRoom(String roomId) {
        return joinedRooms.contains(roomId);
    }
}
