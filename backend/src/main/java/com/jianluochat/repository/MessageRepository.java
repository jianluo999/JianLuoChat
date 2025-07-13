package com.jianluochat.repository;

import com.jianluochat.entity.Message;
import com.jianluochat.entity.Room;
import com.jianluochat.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    Page<Message> findByRoomAndIsDeletedFalseOrderByCreatedAtDesc(Room room, Pageable pageable);
    
    List<Message> findByRoomAndIsDeletedFalseOrderByCreatedAtAsc(Room room);
    
    @Query("SELECT m FROM Message m WHERE m.room = :room AND m.isDeleted = false AND m.createdAt > :since ORDER BY m.createdAt ASC")
    List<Message> findRecentMessages(@Param("room") Room room, @Param("since") LocalDateTime since);
    
    @Query("SELECT m FROM Message m WHERE m.room = :room AND m.isDeleted = false ORDER BY m.createdAt DESC LIMIT 1")
    Optional<Message> findLatestMessage(@Param("room") Room room);
    
    @Query("SELECT m FROM Message m WHERE m.room = :room AND m.content LIKE %:keyword% AND m.isDeleted = false ORDER BY m.createdAt DESC")
    Page<Message> searchMessagesInRoom(@Param("room") Room room, @Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.room = :room AND m.createdAt > :lastReadAt AND m.sender != :user AND m.isDeleted = false")
    Long countUnreadMessages(@Param("room") Room room, @Param("lastReadAt") LocalDateTime lastReadAt, @Param("user") User user);
    
    List<Message> findBySenderAndIsDeletedFalse(User sender);
    
    void deleteByRoomAndSender(Room room, User sender);
}
