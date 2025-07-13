package com.jianluochat.service;

import com.jianluochat.entity.Room;
import com.jianluochat.entity.RoomInvitation;
import com.jianluochat.entity.User;
import com.jianluochat.repository.RoomInvitationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoomInvitationService {
    
    private static final Logger logger = LoggerFactory.getLogger(RoomInvitationService.class);
    
    @Autowired
    private RoomInvitationRepository invitationRepository;
    
    @Autowired
    private RoomService roomService;

    /**
     * 发送房间邀请
     */
    public RoomInvitation sendInvitation(Room room, User inviter, User invitee, String message) {
        // 检查邀请者是否有权限邀请
        if (!canUserInvite(room, inviter)) {
            throw new RuntimeException("无权限邀请用户到此房间");
        }
        
        // 检查被邀请者是否已经是房间成员
        if (roomService.canUserAccessRoom(room, invitee)) {
            throw new RuntimeException("用户已经是房间成员");
        }
        
        // 检查是否已有待处理的邀请
        Optional<RoomInvitation> existingInvitation = invitationRepository
                .findPendingInvitation(room, inviter, invitee);
        if (existingInvitation.isPresent()) {
            throw new RuntimeException("已有待处理的邀请");
        }
        
        RoomInvitation invitation = new RoomInvitation(room, inviter, invitee, message);
        RoomInvitation savedInvitation = invitationRepository.save(invitation);
        
        logger.info("Invitation sent from {} to {} for room {}", 
                   inviter.getUsername(), invitee.getUsername(), room.getRoomCode());
        
        return savedInvitation;
    }

    /**
     * 接受邀请
     */
    public boolean acceptInvitation(Long invitationId, User user) {
        Optional<RoomInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            return false;
        }
        
        RoomInvitation invitation = invitationOpt.get();
        
        // 检查邀请是否属于当前用户
        if (!invitation.getInvitee().equals(user)) {
            return false;
        }
        
        // 检查邀请状态和有效期
        if (invitation.getStatus() != RoomInvitation.InvitationStatus.PENDING || 
            invitation.isExpired()) {
            return false;
        }
        
        // 加入房间
        boolean joinSuccess = roomService.joinRoom(invitation.getRoom(), user);
        if (joinSuccess) {
            invitation.setStatus(RoomInvitation.InvitationStatus.ACCEPTED);
            invitation.setRespondedAt(LocalDateTime.now());
            invitationRepository.save(invitation);
            
            logger.info("Invitation {} accepted by user {}", invitationId, user.getUsername());
            return true;
        }
        
        return false;
    }

    /**
     * 拒绝邀请
     */
    public boolean declineInvitation(Long invitationId, User user) {
        Optional<RoomInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            return false;
        }
        
        RoomInvitation invitation = invitationOpt.get();
        
        // 检查邀请是否属于当前用户
        if (!invitation.getInvitee().equals(user)) {
            return false;
        }
        
        // 检查邀请状态
        if (invitation.getStatus() != RoomInvitation.InvitationStatus.PENDING) {
            return false;
        }
        
        invitation.setStatus(RoomInvitation.InvitationStatus.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
        
        logger.info("Invitation {} declined by user {}", invitationId, user.getUsername());
        return true;
    }

    /**
     * 获取用户的待处理邀请
     */
    public List<RoomInvitation> getPendingInvitations(User user) {
        return invitationRepository.findPendingInvitations(user, LocalDateTime.now());
    }

    /**
     * 获取房间的邀请列表
     */
    public List<RoomInvitation> getRoomInvitations(Room room) {
        return invitationRepository.findByRoomAndStatus(room, RoomInvitation.InvitationStatus.PENDING);
    }

    /**
     * 取消邀请（仅邀请者可操作）
     */
    public boolean cancelInvitation(Long invitationId, User user) {
        Optional<RoomInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            return false;
        }
        
        RoomInvitation invitation = invitationOpt.get();
        
        // 检查是否是邀请者
        if (!invitation.getInviter().equals(user)) {
            return false;
        }
        
        // 检查邀请状态
        if (invitation.getStatus() != RoomInvitation.InvitationStatus.PENDING) {
            return false;
        }
        
        invitationRepository.delete(invitation);
        
        logger.info("Invitation {} cancelled by user {}", invitationId, user.getUsername());
        return true;
    }

    /**
     * 清理过期邀请
     */
    public void cleanupExpiredInvitations() {
        List<RoomInvitation> allInvitations = invitationRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (RoomInvitation invitation : allInvitations) {
            if (invitation.getStatus() == RoomInvitation.InvitationStatus.PENDING && 
                invitation.getExpiresAt().isBefore(now)) {
                invitation.setStatus(RoomInvitation.InvitationStatus.EXPIRED);
                invitationRepository.save(invitation);
            }
        }
        
        logger.debug("Expired invitations cleaned up");
    }

    /**
     * 检查用户是否可以邀请其他用户到房间
     */
    private boolean canUserInvite(Room room, User user) {
        // 世界频道不需要邀请
        if (room.getType() == Room.RoomType.WORLD) {
            return false;
        }
        
        // 房主可以邀请
        if (room.getOwner().equals(user)) {
            return true;
        }
        
        // 检查是否是房间成员（普通成员也可以邀请）
        return roomService.canUserAccessRoom(room, user);
    }
}
