package com.jianluochat.controller;

import com.jianluochat.entity.Message;
import com.jianluochat.entity.Room;
import com.jianluochat.entity.User;
import com.jianluochat.security.UserPrincipal;
import com.jianluochat.service.MessageService;
import com.jianluochat.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/messages")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private RoomService roomService;

    /**
     * 发送消息
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request,
                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            String roomCode = (String) request.get("roomCode");
            String content = (String) request.get("content");
            String formattedContent = (String) request.get("formattedContent");
            String typeStr = (String) request.get("type");

            if (roomCode == null || content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间码和消息内容不能为空"));
            }

            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间不存在"));
            }

            Message.MessageType type = Message.MessageType.TEXT;
            if (typeStr != null) {
                try {
                    type = Message.MessageType.valueOf(typeStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    // 使用默认类型
                }
            }

            User user = userPrincipal.getUser();
            Message message;

            // 如果有格式化内容，使用格式化消息方法
            if (formattedContent != null && !formattedContent.trim().isEmpty()) {
                message = messageService.sendFormattedMessage(roomOpt.get(), user, content, formattedContent, type);
            } else {
                message = messageService.sendMessage(roomOpt.get(), user, content, type);
            }

            return ResponseEntity.ok(formatMessageResponse(message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 获取房间消息（分页）
     */
    @GetMapping("/room/{roomCode}")
    public ResponseEntity<?> getRoomMessages(@PathVariable String roomCode,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "50") int size,
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间不存在"));
            }
            
            Room room = roomOpt.get();
            User user = userPrincipal.getUser();
            
            if (!roomService.canUserAccessRoom(room, user)) {
                return ResponseEntity.status(403).body(Map.of("error", "无权访问此房间"));
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Message> messagePage = messageService.getRoomMessages(room, pageable);
            
            List<Map<String, Object>> messageList = messagePage.getContent().stream()
                    .map(this::formatMessageResponse)
                    .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("messages", messageList);
            response.put("totalElements", messagePage.getTotalElements());
            response.put("totalPages", messagePage.getTotalPages());
            response.put("currentPage", page);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 标记消息为已读
     */
    @PostMapping("/room/{roomCode}/read")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable String roomCode,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间不存在"));
            }
            
            Room room = roomOpt.get();
            User user = userPrincipal.getUser();
            
            if (!roomService.canUserAccessRoom(room, user)) {
                return ResponseEntity.status(403).body(Map.of("error", "无权访问此房间"));
            }
            
            messageService.markMessagesAsRead(room, user);
            
            return ResponseEntity.ok(Map.of("message", "消息已标记为已读"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 获取未读消息数量
     */
    @GetMapping("/room/{roomCode}/unread-count")
    public ResponseEntity<?> getUnreadMessageCount(@PathVariable String roomCode,
                                                 @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间不存在"));
            }
            
            Room room = roomOpt.get();
            User user = userPrincipal.getUser();
            
            if (!roomService.canUserAccessRoom(room, user)) {
                return ResponseEntity.status(403).body(Map.of("error", "无权访问此房间"));
            }
            
            Long unreadCount = messageService.getUnreadMessageCount(room, user);
            
            return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 编辑消息
     */
    @PutMapping("/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable Long messageId,
                                       @RequestBody Map<String, String> request,
                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            String newContent = request.get("content");
            if (newContent == null || newContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "消息内容不能为空"));
            }
            
            User user = userPrincipal.getUser();
            Message message = messageService.editMessage(messageId, user, newContent);
            
            return ResponseEntity.ok(formatMessageResponse(message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 删除消息
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId,
                                         @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            boolean success = messageService.deleteMessage(messageId, user);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "消息已删除"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "无法删除消息"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 搜索房间内消息
     */
    @GetMapping("/room/{roomCode}/search")
    public ResponseEntity<?> searchMessages(@PathVariable String roomCode,
                                          @RequestParam String keyword,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size,
                                          @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间不存在"));
            }
            
            Room room = roomOpt.get();
            User user = userPrincipal.getUser();
            
            if (!roomService.canUserAccessRoom(room, user)) {
                return ResponseEntity.status(403).body(Map.of("error", "无权访问此房间"));
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Message> messagePage = messageService.searchMessagesInRoom(room, keyword, pageable);
            
            List<Map<String, Object>> messageList = messagePage.getContent().stream()
                    .map(this::formatMessageResponse)
                    .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("messages", messageList);
            response.put("totalElements", messagePage.getTotalElements());
            response.put("totalPages", messagePage.getTotalPages());
            response.put("currentPage", page);
            response.put("keyword", keyword);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 格式化消息响应
     */
    private Map<String, Object> formatMessageResponse(Message message) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", message.getId());
        response.put("content", message.getContent());
        response.put("formattedContent", message.getFormattedContent());
        response.put("format", message.getFormat());
        response.put("type", message.getType().toString());
        response.put("status", message.getStatus().toString());
        response.put("isEdited", message.getIsEdited());
        response.put("isDeleted", message.getIsDeleted());
        response.put("createdAt", message.getCreatedAt());
        response.put("editedAt", message.getEditedAt());
        
        // 发送者信息
        User sender = message.getSender();
        Map<String, Object> senderInfo = new HashMap<>();
        senderInfo.put("id", sender.getId());
        senderInfo.put("username", sender.getUsername());
        senderInfo.put("displayName", sender.getDisplayName());
        senderInfo.put("avatarUrl", sender.getAvatarUrl());
        response.put("sender", senderInfo);
        
        // 房间信息
        Room room = message.getRoom();
        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("id", room.getId());
        roomInfo.put("roomCode", room.getRoomCode());
        roomInfo.put("name", room.getName());
        roomInfo.put("type", room.getType().toString());
        response.put("room", roomInfo);
        
        // 文件信息（如果是文件消息）
        if (message.getType() == Message.MessageType.FILE) {
            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("url", message.getFileUrl());
            fileInfo.put("name", message.getFileName());
            fileInfo.put("size", message.getFileSize());
            response.put("file", fileInfo);
        }
        
        return response;
    }
}
