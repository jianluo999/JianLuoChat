package com.jianluochat.service;

import com.jianluochat.entity.Message;
import com.jianluochat.entity.Room;
import com.jianluochat.entity.RoomMember;
import com.jianluochat.entity.User;
import com.jianluochat.repository.MessageRepository;
import com.jianluochat.repository.RoomMemberRepository;
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
public class MessageService {
    
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private RoomMemberRepository roomMemberRepository;
    
    @Autowired
    private RoomService roomService;

    /**
     * 发送消息
     */
    public Message sendMessage(Room room, User sender, String content, Message.MessageType type) {
        // 检查用户是否可以在房间发送消息
        if (!canUserSendMessage(room, sender)) {
            throw new RuntimeException("用户无权在此房间发送消息");
        }
        
        Message message = new Message(room, sender, content, type);
        Message savedMessage = messageRepository.save(message);
        
        logger.info("Message sent in room {} by user {}", room.getRoomCode(), sender.getUsername());
        
        return savedMessage;
    }

    /**
     * 发送文件消息
     */
    public Message sendFileMessage(Room room, User sender, String content, String fileUrl, 
                                 String fileName, Long fileSize) {
        if (!canUserSendMessage(room, sender)) {
            throw new RuntimeException("用户无权在此房间发送消息");
        }
        
        Message message = new Message(room, sender, content, Message.MessageType.FILE);
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message.setFileSize(fileSize);
        
        Message savedMessage = messageRepository.save(message);
        
        logger.info("File message sent in room {} by user {}", room.getRoomCode(), sender.getUsername());
        
        return savedMessage;
    }

    /**
     * 获取房间消息（分页）
     */
    public Page<Message> getRoomMessages(Room room, Pageable pageable) {
        return messageRepository.findByRoomAndIsDeletedFalseOrderByCreatedAtDesc(room, pageable);
    }

    /**
     * 获取房间最新消息
     */
    public List<Message> getRecentMessages(Room room, LocalDateTime since) {
        return messageRepository.findRecentMessages(room, since);
    }

    /**
     * 获取房间最后一条消息
     */
    public Optional<Message> getLatestMessage(Room room) {
        return messageRepository.findLatestMessage(room);
    }

    /**
     * 搜索房间内消息
     */
    public Page<Message> searchMessagesInRoom(Room room, String keyword, Pageable pageable) {
        return messageRepository.searchMessagesInRoom(room, keyword, pageable);
    }

    /**
     * 标记消息为已读
     */
    public void markMessagesAsRead(Room room, User user) {
        Optional<RoomMember> member = roomMemberRepository.findByRoomAndUser(room, user);
        if (member.isPresent()) {
            member.get().setLastReadAt(LocalDateTime.now());
            roomMemberRepository.save(member.get());
            
            logger.debug("Messages marked as read in room {} by user {}", room.getRoomCode(), user.getUsername());
        }
    }

    /**
     * 获取未读消息数量
     */
    public Long getUnreadMessageCount(Room room, User user) {
        Optional<RoomMember> member = roomMemberRepository.findByRoomAndUser(room, user);
        if (member.isPresent() && member.get().getLastReadAt() != null) {
            return messageRepository.countUnreadMessages(room, member.get().getLastReadAt(), user);
        }
        
        // 如果没有读取记录，返回所有消息数量
        return messageRepository.findByRoomAndIsDeletedFalseOrderByCreatedAtAsc(room).stream()
                .filter(msg -> !msg.getSender().equals(user))
                .count();
    }

    /**
     * 编辑消息
     */
    public Message editMessage(Long messageId, User user, String newContent) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            throw new RuntimeException("消息不存在");
        }
        
        Message message = messageOpt.get();
        if (!message.getSender().equals(user)) {
            throw new RuntimeException("只能编辑自己的消息");
        }
        
        if (message.getIsDeleted()) {
            throw new RuntimeException("无法编辑已删除的消息");
        }
        
        message.setContent(newContent);
        message.setIsEdited(true);
        message.setEditedAt(LocalDateTime.now());
        
        Message savedMessage = messageRepository.save(message);
        
        logger.info("Message {} edited by user {}", messageId, user.getUsername());
        
        return savedMessage;
    }

    /**
     * 删除消息
     */
    public boolean deleteMessage(Long messageId, User user) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return false;
        }
        
        Message message = messageOpt.get();
        if (!message.getSender().equals(user)) {
            return false; // 只能删除自己的消息
        }
        
        message.setIsDeleted(true);
        message.setDeletedAt(LocalDateTime.now());
        messageRepository.save(message);
        
        logger.info("Message {} deleted by user {}", messageId, user.getUsername());
        
        return true;
    }

    /**
     * 检查用户是否可以在房间发送消息
     */
    private boolean canUserSendMessage(Room room, User sender) {
        // 世界频道所有人都可以发送消息
        if (room.getType() == Room.RoomType.WORLD) {
            return true;
        }
        
        // 检查用户是否是房间的活跃成员
        return roomService.canUserAccessRoom(room, sender);
    }
}
