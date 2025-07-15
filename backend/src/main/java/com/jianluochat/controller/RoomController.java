package com.jianluochat.controller;

import com.jianluochat.entity.*;
import com.jianluochat.security.UserPrincipal;
import com.jianluochat.service.MatrixRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rooms")
public class RoomController {
    
    @Autowired
    private MatrixRoomService matrixRoomService;

    /**
     * 获取用户的房间列表
     */
    @GetMapping
    public ResponseEntity<?> getUserRooms(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            List<Map<String, Object>> rooms = matrixRoomService.getUserRooms(user).join();

            // 添加世界频道到房间列表
            Map<String, Object> worldChannel = matrixRoomService.getWorldChannel().join();
            if (rooms != null && worldChannel != null) {
                rooms.add(0, worldChannel); // 将世界频道放在第一位
            } else if (worldChannel != null) {
                rooms = new java.util.ArrayList<>();
                rooms.add(worldChannel);
            } else if (rooms == null) {
                rooms = new java.util.ArrayList<>();
            }

            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 获取世界频道
     */
    @GetMapping("/world")
    public ResponseEntity<?> getWorldChannel() {
        try {
            Map<String, Object> worldChannel = matrixRoomService.getWorldChannel().join();
            return ResponseEntity.ok(worldChannel);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 发送消息到世界频道
     */
    @PostMapping("/world/messages")
    public ResponseEntity<?> sendWorldMessage(@RequestBody Map<String, String> request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            String content = request.get("content");

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "消息内容不能为空"));
            }

            Map<String, Object> result = matrixRoomService.sendMessage(user, matrixRoomService.getWorldChannel().join().get("id").toString(), content).join();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 获取世界频道消息历史
     */
    @GetMapping("/world/messages")
    public ResponseEntity<?> getWorldMessages(@RequestParam(defaultValue = "50") int limit, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            String worldRoomId = matrixRoomService.getWorldChannel().join().get("id").toString();
            List<Map<String, Object>> messages = matrixRoomService.getRoomMessages(user, worldRoomId, limit).join();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 获取用户的私密房间
     */
    @GetMapping("/private")
    public ResponseEntity<?> getPrivateRoom(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            Map<String, Object> privateRoom = matrixRoomService.getUserPrivateRoom(user).join();

            if (privateRoom == null) {
                // 创建私密房间
                Map<String, Object> newRoom = matrixRoomService.createPrivateRoom(user).join();
                return ResponseEntity.ok(newRoom);
            }

            return ResponseEntity.ok(privateRoom);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 获取用户可访问的房间列表
     */
    @GetMapping("/accessible")
    public ResponseEntity<?> getAccessibleRooms(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            List<Map<String, Object>> rooms = matrixRoomService.getUserRooms(user).join();

            return ResponseEntity.ok(Map.of("rooms", rooms));
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 根据房间ID获取房间信息
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoomInfo(@PathVariable String roomId,
                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // 简化实现：返回基本房间信息
            Map<String, Object> roomInfo = Map.of(
                "id", roomId,
                "name", "Matrix房间",
                "type", "matrix"
            );

            return ResponseEntity.ok(roomInfo);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 创建房间（通用接口）
     */
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Map<String, Object> request,
                                      @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            String name = (String) request.get("name");
            String type = (String) request.get("type");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间名称不能为空"));
            }

            User user = userPrincipal.getUser();
            Map<String, Object> room;

            if ("private".equals(type)) {
                // 创建私人房间
                room = matrixRoomService.createGroupRoom(user, name, "私人房间").join();
            } else if ("public".equals(type)) {
                // 创建公开房间
                room = matrixRoomService.createGroupRoom(user, name, "公开房间").join();
            } else {
                // 默认创建群聊房间
                room = matrixRoomService.createGroupRoom(user, name, "群聊房间").join();
            }

            return ResponseEntity.ok(room);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    /**
     * 创建群聊房间
     */
    @PostMapping("/group")
    public ResponseEntity<?> createGroupRoom(@RequestBody Map<String, String> request,
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            String name = request.get("name");
            String description = request.get("description");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间名称不能为空"));
            }

            User user = userPrincipal.getUser();
            Map<String, Object> room = matrixRoomService.createGroupRoom(user, name, description).join();

            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 发送消息到指定房间
     */
    @PostMapping("/{roomId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String roomId,
                                       @RequestBody Map<String, String> request,
                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            String content = request.get("content");

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "消息内容不能为空"));
            }

            Map<String, Object> result = matrixRoomService.sendMessage(user, roomId, content).join();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 获取指定房间的消息
     */
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getRoomMessages(@PathVariable String roomId,
                                           @RequestParam(defaultValue = "50") int limit,
                                           @RequestParam(required = false) String before,
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            List<Map<String, Object>> messages = matrixRoomService.getRoomMessages(user, roomId, limit).join();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 加入房间
     */
    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId,
                                    @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            matrixRoomService.joinRoom(user, roomId).join();
            return ResponseEntity.ok(Map.of("message", "成功加入房间"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 离开房间
     */
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomId,
                                     @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            matrixRoomService.leaveRoom(user, roomId).join();
            return ResponseEntity.ok(Map.of("message", "成功离开房间"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
