package com.jianluochat.entity;

/**
 * Builder模式用于创建Message对象
 * 借鉴Matrix Communication Client的设计理念
 * 
 * @author JianLuoChat Contributors
 */
public class MessageBuilder {
    
    private Room room;
    private User sender;
    private String content;
    private String formattedContent;
    private String format = "org.matrix.custom.html";
    private Message.MessageType type = Message.MessageType.TEXT;
    private Message.MessageStatus status = Message.MessageStatus.SENT;
    private Long replyToId;
    private String fileUrl;
    private String fileName;
    private Long fileSize;

    private MessageBuilder() {}

    /**
     * 创建新的MessageBuilder实例
     */
    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    /**
     * 设置房间
     */
    public MessageBuilder room(Room room) {
        this.room = room;
        return this;
    }

    /**
     * 设置发送者
     */
    public MessageBuilder sender(User sender) {
        this.sender = sender;
        return this;
    }

    /**
     * 设置纯文本内容
     */
    public MessageBuilder content(String content) {
        this.content = content;
        return this;
    }

    /**
     * 设置格式化内容（HTML）
     */
    public MessageBuilder formattedContent(String formattedContent) {
        this.formattedContent = formattedContent;
        return this;
    }

    /**
     * 设置内容格式
     */
    public MessageBuilder format(String format) {
        this.format = format;
        return this;
    }

    /**
     * 设置消息类型
     */
    public MessageBuilder type(Message.MessageType type) {
        this.type = type;
        return this;
    }

    /**
     * 设置消息状态
     */
    public MessageBuilder status(Message.MessageStatus status) {
        this.status = status;
        return this;
    }

    /**
     * 设置回复的消息ID
     */
    public MessageBuilder replyTo(Long replyToId) {
        this.replyToId = replyToId;
        return this;
    }

    /**
     * 设置文件URL
     */
    public MessageBuilder fileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
        return this;
    }

    /**
     * 设置文件名
     */
    public MessageBuilder fileName(String fileName) {
        this.fileName = fileName;
        return this;
    }

    /**
     * 设置文件大小
     */
    public MessageBuilder fileSize(Long fileSize) {
        this.fileSize = fileSize;
        return this;
    }

    /**
     * 构建Message对象
     */
    public Message build() {
        if (room == null) {
            throw new IllegalArgumentException("Room is required");
        }
        if (sender == null) {
            throw new IllegalArgumentException("Sender is required");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content is required");
        }

        Message message = new Message(room, sender, content, formattedContent, format, type);
        message.setStatus(status);
        message.setReplyToId(replyToId);
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message.setFileSize(fileSize);

        return message;
    }

    /**
     * 快速创建文本消息
     */
    public static Message createTextMessage(Room room, User sender, String content) {
        return builder()
            .room(room)
            .sender(sender)
            .content(content)
            .type(Message.MessageType.TEXT)
            .build();
    }

    /**
     * 快速创建格式化文本消息
     */
    public static Message createFormattedMessage(Room room, User sender, String content, String formattedContent) {
        return builder()
            .room(room)
            .sender(sender)
            .content(content)
            .formattedContent(formattedContent)
            .type(Message.MessageType.TEXT)
            .build();
    }

    /**
     * 快速创建文件消息
     */
    public static Message createFileMessage(Room room, User sender, String content, 
                                          String fileUrl, String fileName, Long fileSize) {
        return builder()
            .room(room)
            .sender(sender)
            .content(content)
            .fileUrl(fileUrl)
            .fileName(fileName)
            .fileSize(fileSize)
            .type(Message.MessageType.FILE)
            .build();
    }

    /**
     * 快速创建系统消息
     */
    public static Message createSystemMessage(Room room, User sender, String content) {
        return builder()
            .room(room)
            .sender(sender)
            .content(content)
            .type(Message.MessageType.SYSTEM)
            .build();
    }
}
