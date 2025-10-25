package com.jianluochat.controller;

import com.jianluochat.service.DatabaseRecoveryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 数据库恢复控制器
 * 提供数据库备份、恢复、健康检查和坏块处理的REST API
 */
@RestController
@RequestMapping("/api/database")
@CrossOrigin(origins = "*")
public class DatabaseRecoveryController {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseRecoveryController.class);

    @Autowired
    private DatabaseRecoveryService databaseRecoveryService;

    /**
     * 创建数据库备份
     */
    @PostMapping("/backup")
    public ResponseEntity<?> createDatabaseBackup() {
        try {
            logger.info("API call: createDatabaseBackup");
            
            String backupFileName = databaseRecoveryService.createDatabaseBackup().join();
            
            Map<String, Object> result = Map.of(
                "success", true,
                "message", "Database backup created successfully",
                "backupFileName", backupFileName,
                "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Database backup created: {}", backupFileName);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Failed to create database backup: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to create database backup: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 从备份文件恢复数据库
     */
    @PostMapping("/restore")
    public ResponseEntity<?> restoreDatabaseFromBackup(@RequestBody Map<String, String> request) {
        try {
            String backupFileName = request.get("backupFileName");
            
            if (backupFileName == null || backupFileName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Backup file name is required"
                ));
            }
            
            logger.info("API call: restoreDatabaseFromBackup, backupFile: {}", backupFileName);
            
            String resultMessage = databaseRecoveryService.restoreDatabaseFromBackup(backupFileName).join();
            
            Map<String, Object> result = Map.of(
                "success", true,
                "message", resultMessage,
                "backupFileName", backupFileName,
                "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Database restored from backup: {}", backupFileName);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Failed to restore database from backup: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to restore database: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 检查数据库健康状态
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkDatabaseHealth() {
        try {
            logger.info("API call: checkDatabaseHealth");
            
            Map<String, Object> healthStatus = databaseRecoveryService.checkDatabaseHealth().join();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "healthStatus", healthStatus,
                "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            logger.error("Failed to check database health: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to check database health: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 检测和修复坏块
     */
    @PostMapping("/repair-bad-blocks")
    public ResponseEntity<?> checkAndRepairBadBlocks() {
        try {
            logger.info("API call: checkAndRepairBadBlocks");
            
            Map<String, Object> result = databaseRecoveryService.checkAndRepairBadBlocks().join();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "repairResult", result,
                "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            logger.error("Failed to check and repair bad blocks: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to check and repair bad blocks: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 获取所有可用的备份文件
     */
    @GetMapping("/backups")
    public ResponseEntity<?> getAvailableBackups() {
        try {
            logger.info("API call: getAvailableBackups");
            
            List<String> backups = databaseRecoveryService.getAvailableBackups().join();
            
            Map<String, Object> result = Map.of(
                "success", true,
                "backups", backups,
                "count", backups.size(),
                "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Retrieved {} backup files", backups.size());
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Failed to get available backups: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to get available backups: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 删除指定备份文件
     */
    @DeleteMapping("/backups/{backupFileName}")
    public ResponseEntity<?> deleteBackup(@PathVariable String backupFileName) {
        try {
            logger.info("API call: deleteBackup, backupFile: {}", backupFileName);
            
            String resultMessage = databaseRecoveryService.deleteBackup(backupFileName).join();
            
            Map<String, Object> result = Map.of(
                "success", true,
                "message", resultMessage,
                "backupFileName", backupFileName,
                "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Backup deleted: {}", backupFileName);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Failed to delete backup: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to delete backup: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 获取数据库恢复状态概览
     */
    @GetMapping("/status")
    public ResponseEntity<?> getDatabaseRecoveryStatus() {
        try {
            logger.info("API call: getDatabaseRecoveryStatus");
            
            // 获取备份文件列表
            List<String> backups = databaseRecoveryService.getAvailableBackups().join();
            
            // 检查数据库健康状态
            Map<String, Object> healthStatus = databaseRecoveryService.checkDatabaseHealth().join();
            
            Map<String, Object> result = Map.of(
                "success", true,
                "databaseHealth", healthStatus,
                "availableBackups", backups,
                "backupCount", backups.size(),
                "lastBackup", backups.isEmpty() ? null : backups.get(0),
                "timestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Failed to get database recovery status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to get database recovery status: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    /**
     * 执行完整的数据库恢复流程
     */
    @PostMapping("/full-recovery")
    public ResponseEntity<?> executeFullRecovery(@RequestBody Map<String, String> request) {
        try {
            String backupFileName = request.get("backupFileName");
            
            if (backupFileName == null || backupFileName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Backup file name is required for full recovery"
                ));
            }
            
            logger.info("API call: executeFullRecovery, backupFile: {}", backupFileName);
            
            // 步骤1: 检查数据库健康状态
            Map<String, Object> healthStatus = databaseRecoveryService.checkDatabaseHealth().join();
            
            if (!"healthy".equals(healthStatus.get("status")) && !"degraded".equals(healthStatus.get("status"))) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Database is in unhealthy state. Current status: " + healthStatus.get("status"),
                    "healthStatus", healthStatus
                ));
            }
            
            // 步骤2: 检测和修复坏块
            Map<String, Object> repairResult = databaseRecoveryService.checkAndRepairBadBlocks().join();
            
            // 步骤3: 从备份恢复数据
            String restoreMessage = databaseRecoveryService.restoreDatabaseFromBackup(backupFileName).join();
            
            // 步骤4: 再次检查健康状态
            Map<String, Object> finalHealthStatus = databaseRecoveryService.checkDatabaseHealth().join();
            
            Map<String, Object> result = Map.of(
                "success", true,
                "message", "Full database recovery completed successfully",
                "steps", Map.of(
                    "healthCheck", healthStatus,
                    "badBlockRepair", repairResult,
                    "dataRestore", restoreMessage,
                    "finalHealthCheck", finalHealthStatus
                ),
                "backupFileName", backupFileName,
                "timestamp", System.currentTimeMillis()
            );
            
            logger.info("Full database recovery completed for backup: {}", backupFileName);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Failed to execute full database recovery: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to execute full database recovery: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
}