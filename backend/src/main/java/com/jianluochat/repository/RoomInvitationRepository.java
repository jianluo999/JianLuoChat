package com.jianluochat.repository;

import com.jianluochat.entity.Room;
import com.jianluochat.entity.RoomInvitation;
import com.jianluochat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomInvitationRepository extends JpaRepository<RoomInvitation, Long> {
    
    Optional<RoomInvitation> findByRoomAndInvitee(Room room, User invitee);
    
    List<RoomInvitation> findByInviteeAndStatus(User invitee, RoomInvitation.InvitationStatus status);
    
    List<RoomInvitation> findByRoomAndStatus(Room room, RoomInvitation.InvitationStatus status);
    
    @Query("SELECT ri FROM RoomInvitation ri WHERE ri.invitee = :user AND ri.status = 'PENDING' AND ri.expiresAt > :now")
    List<RoomInvitation> findPendingInvitations(@Param("user") User user, @Param("now") LocalDateTime now);
    
    @Query("SELECT ri FROM RoomInvitation ri WHERE ri.room = :room AND ri.inviter = :inviter AND ri.invitee = :invitee AND ri.status = 'PENDING'")
    Optional<RoomInvitation> findPendingInvitation(@Param("room") Room room, @Param("inviter") User inviter, @Param("invitee") User invitee);
    
    @Query("SELECT COUNT(ri) FROM RoomInvitation ri WHERE ri.invitee = :user AND ri.status = 'PENDING' AND ri.expiresAt > :now")
    Long countPendingInvitations(@Param("user") User user, @Param("now") LocalDateTime now);
    
    Boolean existsByRoomAndInviteeAndStatus(Room room, User invitee, RoomInvitation.InvitationStatus status);
    
    void deleteByRoomAndInvitee(Room room, User invitee);
}
