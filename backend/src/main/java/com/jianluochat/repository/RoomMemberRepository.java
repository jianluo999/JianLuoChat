package com.jianluochat.repository;

import com.jianluochat.entity.Room;
import com.jianluochat.entity.RoomMember;
import com.jianluochat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    
    Optional<RoomMember> findByRoomAndUser(Room room, User user);
    
    List<RoomMember> findByRoomAndStatus(Room room, RoomMember.MemberStatus status);
    
    List<RoomMember> findByUserAndStatus(User user, RoomMember.MemberStatus status);
    
    @Query("SELECT rm FROM RoomMember rm WHERE rm.room = :room AND rm.status = 'ACTIVE'")
    List<RoomMember> findActiveMembers(@Param("room") Room room);
    
    @Query("SELECT rm FROM RoomMember rm WHERE rm.user = :user AND rm.status = 'ACTIVE'")
    List<RoomMember> findUserActiveRooms(@Param("user") User user);
    
    @Query("SELECT COUNT(rm) FROM RoomMember rm WHERE rm.room = :room AND rm.status = 'ACTIVE'")
    Long countActiveMembers(@Param("room") Room room);
    
    Boolean existsByRoomAndUserAndStatus(Room room, User user, RoomMember.MemberStatus status);
    
    void deleteByRoomAndUser(Room room, User user);
}
