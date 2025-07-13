package com.jianluochat.controller;

import com.jianluochat.entity.*;
import com.jianluochat.security.UserPrincipal;
import com.jianluochat.service.MatrixRoomService;
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
@RequestMapping("/rooms")
public class RoomController {
    
    @Autowired
    private MatrixRoomService matrixRoomService;

    /**
     * 获取世界频道
     */
    @GetMapping("/world")
    public ResponseEntity<?> getWorldChannel() {
        try {
            Map<String, Object> worldChannel = matrixRoomService.getWorldChannel().join();
            return ResponseEntity.ok(worldChannel);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
     * 加入房间
     */
    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId,
                                    @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            boolean success = matrixRoomService.joinRoom(user, roomId).join();

            if (success) {
                return ResponseEntity.ok(Map.of("message", "成功加入房间"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "无法加入房间"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
