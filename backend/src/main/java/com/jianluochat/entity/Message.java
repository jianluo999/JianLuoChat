package com.jianluochat.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @NotBlank
    @Size(max = 4000)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Size(max = 4000)
    @Column(name = "formatted_content", columnDefinition = "TEXT")
    private String formattedContent;

    @Size(max = 50)
    @Column(name = "format")
    private String format = "org.matrix.custom.html";

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private MessageType type = MessageType.TEXT;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MessageStatus status = MessageStatus.SENT;

    @Column(name = "reply_to_id")
    private Long replyToId;

    @Size(max = 500)
    @Column(name = "file_url")
    private String fileUrl;

    @Size(max = 100)
    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Message() {}

    public Message(Room room, User sender, String content, MessageType type) {
        this.room = room;
        this.sender = sender;
        this.content = content;
        this.type = type;
    }

    public Message(Room room, User sender, String content, String formattedContent, MessageType type) {
        this.room = room;
        this.sender = sender;
        this.content = content;
        this.formattedContent = formattedContent;
        this.type = type;
    }

    public Message(Room room, User sender, String content, String formattedContent, String format, MessageType type) {
        this.room = room;
        this.sender = sender;
        this.content = content;
        this.formattedContent = formattedContent;
        this.format = format;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFormattedContent() { return formattedContent; }
    public void setFormattedContent(String formattedContent) { this.formattedContent = formattedContent; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }

    public Long getReplyToId() { return replyToId; }
    public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Boolean getIsEdited() { return isEdited; }
    public void setIsEdited(Boolean isEdited) { this.isEdited = isEdited; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum MessageType {
        TEXT,       // 文本消息
        IMAGE,      // 图片消息
        FILE,       // 文件消息
        SYSTEM      // 系统消息
    }

    public enum MessageStatus {
        SENT,       // 已发送
        DELIVERED,  // 已送达
        READ        // 已读
    }
}
