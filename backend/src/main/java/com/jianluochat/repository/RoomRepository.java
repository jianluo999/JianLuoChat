package com.jianluochat.repository;

import com.jianluochat.entity.Room;
import com.jianluochat.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    Optional<Room> findByRoomCode(String roomCode);
    
    Optional<Room> findByTypeAndIsActiveTrue(Room.RoomType type);
    
    List<Room> findByOwnerAndIsActiveTrue(User owner);
    
    @Query("SELECT r FROM Room r WHERE r.isActive = true AND r.type = :type")
    List<Room> findActiveRoomsByType(@Param("type") Room.RoomType type);
    
    @Query("SELECT r FROM Room r JOIN r.members m WHERE m.user = :user AND m.status = 'ACTIVE' AND r.isActive = true")
    List<Room> findUserActiveRooms(@Param("user") User user);
    
    @Query("SELECT r FROM Room r WHERE r.isActive = true AND " +
           "(r.type = 'WORLD' OR (r.type = 'PRIVATE' AND r.owner = :user) OR " +
           "EXISTS (SELECT m FROM RoomMember m WHERE m.room = r AND m.user = :user AND m.status = 'ACTIVE'))")
    List<Room> findAccessibleRooms(@Param("user") User user);
    
    @Query("SELECT r FROM Room r WHERE r.name LIKE %:keyword% AND r.isActive = true")
    Page<Room> searchRoomsByName(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM RoomMember m WHERE m.room = :room AND m.status = 'ACTIVE'")
    Long countActiveMembers(@Param("room") Room room);
    
    Boolean existsByRoomCode(String roomCode);
}
