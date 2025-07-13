package com.jianluochat.matrix;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class MatrixSyncService {

    private static final Logger logger = LoggerFactory.getLogger(MatrixSyncService.class);

    @Autowired
    private MatrixClientService matrixClientService;

    @Autowired
    private MatrixEventHandler matrixEventHandler;

    private final AtomicBoolean isSyncing = new AtomicBoolean(false);
    private String nextBatch = null;

    /**
     * Start continuous sync with Matrix homeserver
     */
    @Async
    public CompletableFuture<Void> startSync() {
        if (!matrixClientService.isAuthenticated()) {
            logger.warn("Cannot start sync - Matrix client not authenticated");
            return CompletableFuture.completedFuture(null);
        }

        if (isSyncing.compareAndSet(false, true)) {
            logger.info("Starting Matrix sync for user: {}", matrixClientService.getCurrentUserId());
            return syncLoop();
        } else {
            logger.warn("Sync already running");
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Stop the sync loop
     */
    public void stopSync() {
        if (isSyncing.compareAndSet(true, false)) {
            logger.info("Stopping Matrix sync");
        }
    }

    /**
     * Check if sync is currently running
     */
    public boolean isSyncing() {
        return isSyncing.get();
    }

    /**
     * Perform a single sync operation (简化版本)
     */
    public CompletableFuture<Map<String, Object>> performSync() {
        return matrixClientService.sync(nextBatch)
            .thenApply(syncResponse -> {
                // Update next batch token
                nextBatch = (String) syncResponse.get("nextBatch");

                // Process events (简化版本)
                matrixEventHandler.processSyncResponse(syncResponse);

                return syncResponse;
            })
            .exceptionally(throwable -> {
                logger.error("Sync failed: {}", throwable.getMessage());
                return null;
            });
    }

    /**
     * Main sync loop
     */
    private CompletableFuture<Void> syncLoop() {
        return CompletableFuture.runAsync(() -> {
            while (isSyncing.get()) {
                try {
                    Map<String, Object> syncResponse = performSync().join();
                    
                    if (syncResponse == null) {
                        // Sync failed, wait before retrying
                        Thread.sleep(5000);
                        continue;
                    }
                    
                    logger.debug("Sync completed, next_batch: {}", syncResponse.get("nextBatch"));
                    
                } catch (InterruptedException e) {
                    logger.info("Sync loop interrupted");
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    logger.error("Error in sync loop: {}", e.getMessage());
                    try {
                        Thread.sleep(5000); // Wait before retrying
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
            
            logger.info("Matrix sync loop stopped");
        });
    }

    /**
     * Reset sync state (useful for reconnection)
     */
    public void resetSync() {
        stopSync();
        nextBatch = null;
    }

    /**
     * Get current sync status
     */
    public SyncStatus getSyncStatus() {
        return new SyncStatus(isSyncing.get(), nextBatch, matrixClientService.getCurrentUserId());
    }

    public static class SyncStatus {
        private final boolean syncing;
        private final String nextBatch;
        private final String userId;

        public SyncStatus(boolean syncing, String nextBatch, String userId) {
            this.syncing = syncing;
            this.nextBatch = nextBatch;
            this.userId = userId;
        }

        public boolean isSyncing() { return syncing; }
        public String getNextBatch() { return nextBatch; }
        public String getUserId() { return userId; }
    }
}
