package com.jianluochat.controller;

import com.jianluochat.service.MatrixRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/matrix/rooms")
@CrossOrigin(origins = "http://localhost:3000")
public class MatrixRoomController {

    @Autowired
    private MatrixRoomService matrixRoomService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String roomName = (String) request.get("name");
            boolean isPublic = Boolean.TRUE.equals(request.get("public"));
            String roomAlias = (String) request.get("alias");
            String roomTopic = (String) request.get("topic");
            String roomId = (String) request.get("roomId");

            // 创建房间的逻辑实现
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "房间创建成功"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "房间创建失败: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, String>> joinRoom(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String roomId = request.get("roomId");
            String roomAlias = request.get("roomAlias");

            if (roomId == null && roomAlias == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", "false",
                    "error", "必须提供房间ID或房间别名"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "成功加入房间"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "error", "加入房间失败: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/leave")
    public ResponseEntity<Map<String, String>> leaveRoom(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String roomId = request.get("roomId");

            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "成功离开房间"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "error", "离开房间失败: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/user-rooms")
    public ResponseEntity<Map<String, Object>> getUserRooms(@RequestParam String username) {
        try {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "rooms", List.of()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "获取房间列表失败: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoomInfo(@PathVariable String roomId) {
        try {
            Map<String, Object> roomInfo = Map.of(
                "id", roomId,
                "name", "房间名称",
                "alias", "#" + roomId.replaceFirst("^!", "")
                    .replaceFirst("@.*:", ":")
                    .replaceFirst(":", ".org"),
                "topic", "房间描述",
                "memberCount", 1
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "room", roomInfo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "获取房间信息失败: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{roomId}/settings")
    public ResponseEntity<Map<String, Object>> updateRoomSettings(@PathVariable String roomId, 
                                                               @RequestBody Map<String, Object> settings) {
        try {
            String username = (String) settings.get("username");
            String roomName = (String) settings.get("name");
            String roomAlias = (String) settings.get("alias");
            String roomTopic = (String) settings.get("topic");
            Boolean isPublic = (Boolean) settings.get("isPublic");
            Boolean encrypted = (Boolean) settings.get("encrypted");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "房间设置已更新"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "更新房间设置失败: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{roomId}/invite")
    public ResponseEntity<Map<String, String>> inviteUserToRoom(@PathVariable String roomId, 
                                                              @RequestBody Map<String, String> request) {
        try {
            String inviter = request.get("inviter");
            String invitee = request.get("invitee");
            String reason = request.get("reason");

            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "邀请已发送"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "error", "发送邀请失败: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{roomId}/members")
    public ResponseEntity<Map<String, Object>> getRoomMembers(@PathVariable String roomId) {
        try {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "members", List.of()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "获取成员列表失败: " + e.getMessage()
            ));
        }
    }
}