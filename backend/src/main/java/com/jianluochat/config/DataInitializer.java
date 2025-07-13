package com.jianluochat.config;

import com.jianluochat.entity.Role;
import com.jianluochat.repository.RoleRepository;
import com.jianluochat.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoomService roomService;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeWorldChannel();
    }

    private void initializeRoles() {
        try {
            // Check if roles already exist
            if (roleRepository.count() > 0) {
                logger.info("Roles already initialized, skipping...");
                return;
            }

            // Create default roles
            Role userRole = new Role(Role.RoleName.ROLE_USER, "Default user role");
            Role adminRole = new Role(Role.RoleName.ROLE_ADMIN, "Administrator role");
            Role moderatorRole = new Role(Role.RoleName.ROLE_MODERATOR, "Moderator role");

            roleRepository.save(userRole);
            roleRepository.save(adminRole);
            roleRepository.save(moderatorRole);

            logger.info("Default roles initialized successfully");
            logger.info("Created roles: USER, ADMIN, MODERATOR");

        } catch (Exception e) {
            logger.error("Error initializing roles: {}", e.getMessage(), e);
        }
    }

    private void initializeWorldChannel() {
        try {
            roomService.getOrCreateWorldChannel();
            logger.info("World channel initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize world channel: {}", e.getMessage());
        }
    }
}
