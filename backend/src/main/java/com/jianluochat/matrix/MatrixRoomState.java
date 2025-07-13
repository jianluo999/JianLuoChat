package com.jianluochat.matrix;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Matrix房间状态
 * 模拟Matrix协议中的分布式房间状态管理
 */
public class MatrixRoomState {
    
    private final String roomId;
    private final String roomAlias;
    private final LocalDateTime createdAt;
    private final Map<String, Object> stateEvents;
    private final Set<String> members;
    private final Map<String, String> memberPowerLevels;
    private String name;
    private String topic;
    private String creator;
    private boolean isPublic;
    private boolean isEncrypted;
    
    public MatrixRoomState(String roomId, String roomAlias, String creator) {
        this.roomId = roomId;
        this.roomAlias = roomAlias;
        this.creator = creator;
        this.createdAt = LocalDateTime.now();
        this.stateEvents = new ConcurrentHashMap<>();
        this.members = ConcurrentHashMap.newKeySet();
        this.memberPowerLevels = new ConcurrentHashMap<>();
        this.isPublic = false;
        this.isEncrypted = false;
        
        // 创建者自动加入并获得最高权限
        this.members.add(creator);
        this.memberPowerLevels.put(creator, "100"); // Matrix中100是最高权限级别
    }
    
    public String getRoomId() {
        return roomId;
    }
    
    public String getRoomAlias() {
        return roomAlias;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
        stateEvents.put("m.room.name", Map.of("name", name));
    }
    
    public String getTopic() {
        return topic;
    }
    
    public void setTopic(String topic) {
        this.topic = topic;
        stateEvents.put("m.room.topic", Map.of("topic", topic));
    }
    
    public String getCreator() {
        return creator;
    }
    
    public boolean isPublic() {
        return isPublic;
    }
    
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
        stateEvents.put("m.room.join_rules", Map.of("join_rule", isPublic ? "public" : "invite"));
    }
    
    public boolean isEncrypted() {
        return isEncrypted;
    }
    
    public void setEncrypted(boolean encrypted) {
        this.isEncrypted = encrypted;
        if (encrypted) {
            stateEvents.put("m.room.encryption", Map.of("algorithm", "m.megolm.v1.aes-sha2"));
        }
    }
    
    public Set<String> getMembers() {
        return members;
    }
    
    public void addMember(String userId) {
        members.add(userId);
        memberPowerLevels.put(userId, "0"); // 默认权限级别
        stateEvents.put("m.room.member:" + userId, Map.of(
            "membership", "join",
            "displayname", extractUsernameFromId(userId)
        ));
    }
    
    public void removeMember(String userId) {
        members.remove(userId);
        memberPowerLevels.remove(userId);
        stateEvents.put("m.room.member:" + userId, Map.of("membership", "leave"));
    }
    
    public boolean isMember(String userId) {
        return members.contains(userId);
    }
    
    public String getPowerLevel(String userId) {
        return memberPowerLevels.getOrDefault(userId, "0");
    }
    
    public void setPowerLevel(String userId, String level) {
        if (members.contains(userId)) {
            memberPowerLevels.put(userId, level);
            stateEvents.put("m.room.power_levels", memberPowerLevels);
        }
    }
    
    public Map<String, Object> getStateEvents() {
        return stateEvents;
    }
    
    public int getMemberCount() {
        return members.size();
    }
    
    private String extractUsernameFromId(String userId) {
        // 从 @username:domain 格式中提取用户名
        if (userId.startsWith("@") && userId.contains(":")) {
            return userId.substring(1, userId.indexOf(":"));
        }
        return userId;
    }
}
