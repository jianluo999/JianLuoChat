package com.jianluochat.service;

import com.jianluochat.entity.*;
import com.jianluochat.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoomService {
    
    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);
    
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoomMemberRepository roomMemberRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private RoomInvitationRepository invitationRepository;

    /**
     * 获取或创建世界频道
     */
    public Room getOrCreateWorldChannel() {
        Optional<Room> worldRoom = roomRepository.findByTypeAndIsActiveTrue(Room.RoomType.WORLD);

        if (worldRoom.isPresent()) {
            return worldRoom.get();
        }

        // 获取或创建系统用户作为世界频道的所有者
        User systemUser = getOrCreateSystemUser();

        // 创建世界频道
        Room worldChannel = new Room("世界频道", Room.RoomType.WORLD, systemUser);
        worldChannel.setDescription("所有用户都可以参与的公共聊天频道");
        worldChannel.setMaxMembers(null); // 无限制

        Room savedRoom = roomRepository.save(worldChannel);
        logger.info("Created world channel: {}", savedRoom.getRoomCode());

        return savedRoom;
    }

    /**
     * 获取或创建系统用户
     */
    private User getOrCreateSystemUser() {
        Optional<User> systemUser = userRepository.findByUsername("system");

        if (systemUser.isPresent()) {
            return systemUser.get();
        }

        // 创建系统用户
        User newSystemUser = new User();
        newSystemUser.setUsername("system");
        newSystemUser.setEmail("system@jianluochat.com");
        newSystemUser.setDisplayName("System");
        newSystemUser.setPassword("$2a$10$dummy.password.hash"); // 虚拟密码哈希

        User savedSystemUser = userRepository.save(newSystemUser);
        logger.info("Created system user: {}", savedSystemUser.getUsername());

        return savedSystemUser;
    }

    /**
     * 为用户创建私密房间
     */
    public Room createPrivateRoom(User owner) {
        Room privateRoom = new Room(owner.getDisplayName() + "的房间", Room.RoomType.PRIVATE, owner);
        privateRoom.setDescription("私密聊天房间");
        
        Room savedRoom = roomRepository.save(privateRoom);
        
        // 添加房主为成员
        RoomMember ownerMember = new RoomMember(savedRoom, owner, RoomMember.MemberRole.OWNER);
        roomMemberRepository.save(ownerMember);
        
        logger.info("Created private room for user {}: {}", owner.getUsername(), savedRoom.getRoomCode());
        
        return savedRoom;
    }

    /**
     * 创建群聊房间
     */
    public Room createGroupRoom(String name, String description, User owner) {
        Room groupRoom = new Room(name, Room.RoomType.GROUP, owner);
        groupRoom.setDescription(description);
        
        Room savedRoom = roomRepository.save(groupRoom);
        
        // 添加房主为成员
        RoomMember ownerMember = new RoomMember(savedRoom, owner, RoomMember.MemberRole.OWNER);
        roomMemberRepository.save(ownerMember);
        
        logger.info("Created group room: {} by user {}", savedRoom.getRoomCode(), owner.getUsername());
        
        return savedRoom;
    }

    /**
     * 根据房间码查找房间
     */
    public Optional<Room> findByRoomCode(String roomCode) {
        return roomRepository.findByRoomCode(roomCode);
    }

    /**
     * 获取用户可访问的房间列表
     */
    public List<Room> getUserAccessibleRooms(User user) {
        return roomRepository.findAccessibleRooms(user);
    }

    /**
     * 获取用户的私密房间
     */
    public Optional<Room> getUserPrivateRoom(User user) {
        List<Room> privateRooms = roomRepository.findByOwnerAndIsActiveTrue(user);
        return privateRooms.stream()
                .filter(room -> room.getType() == Room.RoomType.PRIVATE)
                .findFirst();
    }

    /**
     * 加入房间
     */
    public boolean joinRoom(Room room, User user) {
        // 检查是否已经是成员
        Optional<RoomMember> existingMember = roomMemberRepository.findByRoomAndUser(room, user);
        if (existingMember.isPresent() && existingMember.get().getStatus() == RoomMember.MemberStatus.ACTIVE) {
            return true; // 已经是活跃成员
        }
        
        // 检查房间容量
        if (room.getMaxMembers() != null) {
            Long currentMemberCount = roomMemberRepository.countActiveMembers(room);
            if (currentMemberCount >= room.getMaxMembers()) {
                return false; // 房间已满
            }
        }
        
        // 添加或重新激活成员
        RoomMember member;
        if (existingMember.isPresent()) {
            member = existingMember.get();
            member.setStatus(RoomMember.MemberStatus.ACTIVE);
            member.setJoinedAt(LocalDateTime.now());
        } else {
            member = new RoomMember(room, user, RoomMember.MemberRole.MEMBER);
        }
        
        roomMemberRepository.save(member);
        logger.info("User {} joined room {}", user.getUsername(), room.getRoomCode());
        
        return true;
    }

    /**
     * 离开房间
     */
    public void leaveRoom(Room room, User user) {
        Optional<RoomMember> member = roomMemberRepository.findByRoomAndUser(room, user);
        if (member.isPresent()) {
            member.get().setStatus(RoomMember.MemberStatus.LEFT);
            roomMemberRepository.save(member.get());
            logger.info("User {} left room {}", user.getUsername(), room.getRoomCode());
        }
    }

    /**
     * 检查用户是否可以访问房间
     */
    public boolean canUserAccessRoom(Room room, User user) {
        if (room.getType() == Room.RoomType.WORLD) {
            return true; // 世界频道所有人都可以访问
        }
        
        if (room.getOwner().equals(user)) {
            return true; // 房主可以访问
        }
        
        // 检查是否是活跃成员
        return roomMemberRepository.existsByRoomAndUserAndStatus(room, user, RoomMember.MemberStatus.ACTIVE);
    }

    /**
     * 获取房间成员列表
     */
    public List<RoomMember> getRoomMembers(Room room) {
        return roomMemberRepository.findActiveMembers(room);
    }

    /**
     * 搜索房间
     */
    public Page<Room> searchRooms(String keyword, Pageable pageable) {
        return roomRepository.searchRoomsByName(keyword, pageable);
    }

    /**
     * 删除房间（仅房主可操作）
     */
    public boolean deleteRoom(Room room, User user) {
        if (!room.getOwner().equals(user)) {
            return false; // 只有房主可以删除房间
        }
        
        if (room.getType() == Room.RoomType.WORLD) {
            return false; // 世界频道不能删除
        }
        
        room.setIsActive(false);
        roomRepository.save(room);
        
        logger.info("Room {} deleted by owner {}", room.getRoomCode(), user.getUsername());
        return true;
    }
}
