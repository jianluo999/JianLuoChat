package com.jianluochat.repository;

import com.jianluochat.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(Role.RoleName name);
    
    Boolean existsByName(Role.RoleName name);
}
