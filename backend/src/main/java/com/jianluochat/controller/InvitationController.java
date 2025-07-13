package com.jianluochat.controller;

import com.jianluochat.entity.Room;
import com.jianluochat.entity.RoomInvitation;
import com.jianluochat.entity.User;
import com.jianluochat.repository.UserRepository;
import com.jianluochat.security.UserPrincipal;
import com.jianluochat.service.RoomInvitationService;
import com.jianluochat.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/invitations")
public class InvitationController {
    
    @Autowired
    private RoomInvitationService invitationService;
    
    @Autowired
    private RoomService roomService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * 发送房间邀请
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendInvitation(@RequestBody Map<String, String> request,
                                          @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            String roomCode = request.get("roomCode");
            String inviteeUsername = request.get("inviteeUsername");
            String message = request.get("message");
            
            if (roomCode == null || inviteeUsername == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间码和被邀请用户名不能为空"));
            }
            
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间不存在"));
            }
            
            Optional<User> inviteeOpt = userRepository.findByUsername(inviteeUsername);
            if (inviteeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "被邀请用户不存在"));
            }
            
            User inviter = userPrincipal.getUser();
            RoomInvitation invitation = invitationService.sendInvitation(
                roomOpt.get(), inviter, inviteeOpt.get(), message);
            
            return ResponseEntity.ok(formatInvitationResponse(invitation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 获取用户的待处理邀请
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingInvitations(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            List<RoomInvitation> invitations = invitationService.getPendingInvitations(user);
            
            List<Map<String, Object>> invitationList = invitations.stream()
                    .map(this::formatInvitationResponse)
                    .toList();
            
            return ResponseEntity.ok(Map.of("invitations", invitationList));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 接受邀请
     */
    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable Long invitationId,
                                            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            boolean success = invitationService.acceptInvitation(invitationId, user);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "邀请已接受，成功加入房间"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "无法接受邀请"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 拒绝邀请
     */
    @PostMapping("/{invitationId}/decline")
    public ResponseEntity<?> declineInvitation(@PathVariable Long invitationId,
                                             @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            boolean success = invitationService.declineInvitation(invitationId, user);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "邀请已拒绝"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "无法拒绝邀请"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 取消邀请
     */
    @DeleteMapping("/{invitationId}")
    public ResponseEntity<?> cancelInvitation(@PathVariable Long invitationId,
                                            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userPrincipal.getUser();
            boolean success = invitationService.cancelInvitation(invitationId, user);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "邀请已取消"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "无法取消邀请"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 获取房间的邀请列表
     */
    @GetMapping("/room/{roomCode}")
    public ResponseEntity<?> getRoomInvitations(@PathVariable String roomCode,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "房间不存在"));
            }
            
            Room room = roomOpt.get();
            User user = userPrincipal.getUser();
            
            // 只有房主和管理员可以查看房间邀请列表
            if (!room.getOwner().equals(user)) {
                return ResponseEntity.status(403).body(Map.of("error", "无权查看房间邀请列表"));
            }
            
            List<RoomInvitation> invitations = invitationService.getRoomInvitations(room);
            
            List<Map<String, Object>> invitationList = invitations.stream()
                    .map(this::formatInvitationResponse)
                    .toList();
            
            return ResponseEntity.ok(Map.of("invitations", invitationList));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 格式化邀请响应
     */
    private Map<String, Object> formatInvitationResponse(RoomInvitation invitation) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", invitation.getId());
        response.put("message", invitation.getMessage());
        response.put("status", invitation.getStatus().toString());
        response.put("expiresAt", invitation.getExpiresAt());
        response.put("respondedAt", invitation.getRespondedAt());
        response.put("createdAt", invitation.getCreatedAt());
        
        // 房间信息
        Room room = invitation.getRoom();
        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("id", room.getId());
        roomInfo.put("roomCode", room.getRoomCode());
        roomInfo.put("name", room.getName());
        roomInfo.put("description", room.getDescription());
        roomInfo.put("type", room.getType().toString());
        response.put("room", roomInfo);
        
        // 邀请者信息
        User inviter = invitation.getInviter();
        Map<String, Object> inviterInfo = new HashMap<>();
        inviterInfo.put("id", inviter.getId());
        inviterInfo.put("username", inviter.getUsername());
        inviterInfo.put("displayName", inviter.getDisplayName());
        inviterInfo.put("avatarUrl", inviter.getAvatarUrl());
        response.put("inviter", inviterInfo);
        
        // 被邀请者信息
        User invitee = invitation.getInvitee();
        Map<String, Object> inviteeInfo = new HashMap<>();
        inviteeInfo.put("id", invitee.getId());
        inviteeInfo.put("username", invitee.getUsername());
        inviteeInfo.put("displayName", invitee.getDisplayName());
        inviteeInfo.put("avatarUrl", invitee.getAvatarUrl());
        response.put("invitee", inviteeInfo);
        
        return response;
    }
}
