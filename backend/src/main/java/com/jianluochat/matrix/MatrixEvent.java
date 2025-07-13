package com.jianluochat.matrix;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Matrix事件
 * 模拟Matrix协议中的事件系统
 * 
 * Matrix中所有操作都是事件：
 * - m.room.message: 消息事件
 * - m.room.member: 成员变更事件
 * - m.room.create: 房间创建事件
 * - m.room.name: 房间名称变更事件
 * - m.typing: 输入状态事件
 */
public class MatrixEvent {
    
    private final String eventId;
    private final String type;
    private final String roomId;
    private final String sender;
    private final Map<String, Object> content;
    private final LocalDateTime timestamp;
    private final long originServerTs;
    private String stateKey; // 状态事件才有
    
    public MatrixEvent(String type, String roomId, String sender, Map<String, Object> content) {
        this.eventId = "$" + UUID.randomUUID().toString();
        this.type = type;
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.originServerTs = System.currentTimeMillis();
    }
    
    public MatrixEvent(String type, String roomId, String sender, Map<String, Object> content, String stateKey) {
        this(type, roomId, sender, content);
        this.stateKey = stateKey;
    }
    
    public String getEventId() {
        return eventId;
    }
    
    public String getType() {
        return type;
    }
    
    public String getRoomId() {
        return roomId;
    }
    
    public String getSender() {
        return sender;
    }
    
    public Map<String, Object> getContent() {
        return content;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public long getOriginServerTs() {
        return originServerTs;
    }
    
    public String getStateKey() {
        return stateKey;
    }
    
    public void setStateKey(String stateKey) {
        this.stateKey = stateKey;
    }
    
    public boolean isStateEvent() {
        return stateKey != null;
    }
    
    public boolean isMessageEvent() {
        return "m.room.message".equals(type);
    }
    
    public boolean isMemberEvent() {
        return "m.room.member".equals(type);
    }
    
    public boolean isTypingEvent() {
        return "m.typing".equals(type);
    }
    
    /**
     * 创建消息事件
     */
    public static MatrixEvent createMessageEvent(String roomId, String sender, String messageType, String body) {
        Map<String, Object> content = Map.of(
            "msgtype", messageType,
            "body", body
        );
        return new MatrixEvent("m.room.message", roomId, sender, content);
    }
    
    /**
     * 创建成员事件
     */
    public static MatrixEvent createMemberEvent(String roomId, String sender, String targetUser, String membership) {
        Map<String, Object> content = Map.of(
            "membership", membership,
            "displayname", extractUsernameFromId(targetUser)
        );
        return new MatrixEvent("m.room.member", roomId, sender, content, targetUser);
    }
    
    /**
     * 创建房间创建事件
     */
    public static MatrixEvent createRoomCreateEvent(String roomId, String creator) {
        Map<String, Object> content = Map.of(
            "creator", creator,
            "room_version", "9" // Matrix房间版本
        );
        return new MatrixEvent("m.room.create", roomId, creator, content, "");
    }
    
    /**
     * 创建输入状态事件
     */
    public static MatrixEvent createTypingEvent(String roomId, String sender, boolean isTyping) {
        Map<String, Object> content = Map.of(
            "user_ids", isTyping ? java.util.List.of(sender) : java.util.List.of()
        );
        return new MatrixEvent("m.typing", roomId, sender, content);
    }
    
    private static String extractUsernameFromId(String userId) {
        if (userId.startsWith("@") && userId.contains(":")) {
            return userId.substring(1, userId.indexOf(":"));
        }
        return userId;
    }
    
    @Override
    public String toString() {
        return "MatrixEvent{" +
                "eventId='" + eventId + '\'' +
                ", type='" + type + '\'' +
                ", roomId='" + roomId + '\'' +
                ", sender='" + sender + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
