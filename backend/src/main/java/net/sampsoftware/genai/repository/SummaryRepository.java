package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Summary;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SummaryRepository extends JpaRepository<Summary, Long> {

    List<Summary> findByItemIdIn(List<Long> itemIds);

    List<Summary> findByItemId(Long itemId);

    List<Summary> findByItemIdOrderByCreatedAtDesc(Long itemId);

    List<Summary> findByBatchId(Long batchId);

    List<Summary> findByBatchIdOrderByCreatedAtDesc(Long batchId);

    List<Summary> findByBatchIdIsNull();

    @Query("SELECT s FROM Summary s WHERE s.modelConfiguration.id = :modelConfigurationId")
    List<Summary> findByModelConfigurationId(@Param("modelConfigurationId") Long modelConfigurationId);

    @Query("SELECT s FROM Summary s WHERE s.modelConfiguration.id = :modelConfigurationId ORDER BY s.createdAt DESC")
    List<Summary> findByModelConfigurationIdOrderByCreatedAtDesc(@Param("modelConfigurationId") Long modelConfigurationId);

    @Query("SELECT s FROM Summary s " +
            "JOIN FETCH s.modelConfiguration mc " +
            "JOIN FETCH mc.model " +
            "WHERE s.id = :id")
    Optional<Summary> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT s FROM Summary s " +
            "JOIN FETCH s.modelConfiguration mc " +
            "JOIN FETCH mc.model " +
            "ORDER BY s.createdAt DESC")
    List<Summary> findAllWithDetails();

    @Query("SELECT s FROM Summary s " +
            "JOIN FETCH s.modelConfiguration mc " +
            "JOIN FETCH mc.model " +
            "WHERE s.itemId IN :itemIds " +
            "ORDER BY s.createdAt DESC")
    List<Summary> findByItemIdInWithDetails(@Param("itemIds") List<Long> itemIds);

    @Query("SELECT s FROM Summary s " +
            "JOIN FETCH s.modelConfiguration mc " +
            "JOIN FETCH mc.model " +
            "WHERE s.batchId = :batchId " +
            "ORDER BY s.createdAt DESC")
    List<Summary> findByBatchIdWithDetails(@Param("batchId") Long batchId);

    /**
     * Count distinct items that have summaries
     */
    @Query("SELECT COUNT(DISTINCT s.itemId) FROM Summary s")
    long countDistinctItems();

    /**
     * Count distinct batches
     */
    @Query("SELECT COUNT(DISTINCT s.batchId) FROM Summary s WHERE s.batchId IS NOT NULL")
    long countDistinctBatches();

    /**
     * Count summaries by model (for analytics)
     */
    @Query("SELECT mc.model.id, mc.model.modelName, mc.model.modelProvider, COUNT(s) " +
            "FROM Summary s JOIN s.modelConfiguration mc " +
            "GROUP BY mc.model.id, mc.model.modelName, mc.model.modelProvider " +
            "ORDER BY COUNT(s) DESC")
    List<Object[]> countSummariesByModel();

    /**
     * Count summaries by model configuration
     */
    @Query("SELECT mc.id, mc.comment, COUNT(s) " +
            "FROM Summary s JOIN s.modelConfiguration mc " +
            "GROUP BY mc.id, mc.comment " +
            "ORDER BY COUNT(s) DESC")
    List<Object[]> countSummariesByModelConfiguration();

    /**
     * Get recent batch statistics
     */
    @Query("SELECT s.batchId, COUNT(s), MIN(s.createdAt), MAX(s.createdAt) " +
            "FROM Summary s WHERE s.batchId IS NOT NULL " +
            "GROUP BY s.batchId " +
            "ORDER BY MAX(s.createdAt) DESC")
    List<Object[]> getRecentBatchCounts(Pageable pageable);

    /**
     * Convenience method for recent batch stats
     */
    default List<Object[]> getRecentBatchCounts(int limit) {
        return getRecentBatchCounts(PageRequest.of(0, limit));
    }

    /**
     * Count summaries by item type (requires join with Item table)
     */
    @Query("SELECT i.itemType, COUNT(s) " +
            "FROM Summary s JOIN Item i ON i.id = s.itemId " +
            "GROUP BY i.itemType " +
            "ORDER BY COUNT(s) DESC")
    List<Object[]> countSummariesByItemType();

    /**
     * Get summary length statistics
     */
    @Query("SELECT AVG(LENGTH(s.content)), MIN(LENGTH(s.content)), MAX(LENGTH(s.content)) " +
            "FROM Summary s")
    Object[] getSummaryLengthStats();

    /**
     * Count summaries created in the last N days
     */
    @Query("SELECT COUNT(s) FROM Summary s WHERE s.createdAt >= :date")
    long countSummariesSince(@Param("date") LocalDateTime date);

    /**
     * Convenience method for recent summary count
     */
    default long countSummariesInLastDays(int days) {
        return countSummariesSince(LocalDateTime.now().minusDays(days));
    }

    // === ADVANCED QUERIES ===

    /**
     * Find summaries with content containing specific text
     */
    @Query("SELECT s FROM Summary s WHERE LOWER(s.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Summary> findByContentContaining(@Param("searchTerm") String searchTerm);

    /**
     * Find summaries with specific metadata attributes
     */
    @Query("SELECT s FROM Summary s WHERE s.metadata IS NOT NULL")
    List<Summary> findSummariesWithMetadata();

    /**
     * Find summaries without metadata
     */
    @Query("SELECT s FROM Summary s WHERE s.metadata IS NULL")
    List<Summary> findSummariesWithoutMetadata();

    /**
     * Find summaries by content length range
     */
    @Query("SELECT s FROM Summary s WHERE LENGTH(s.content) BETWEEN :minLength AND :maxLength")
    List<Summary> findByContentLength(@Param("minLength") int minLength, @Param("maxLength") int maxLength);

    /**
     * Find items with multiple summaries (useful for analysis)
     */
    @Query("SELECT s.itemId, COUNT(s) FROM Summary s " +
            "GROUP BY s.itemId HAVING COUNT(s) > 1 " +
            "ORDER BY COUNT(s) DESC")
    List<Object[]> findItemsWithMultipleSummaries();

    /**
     * Find batches with failed summaries (if you track failures)
     */
    @Query("SELECT s.batchId, COUNT(s) FROM Summary s " +
            "WHERE s.batchId IS NOT NULL " +
            "GROUP BY s.batchId " +
            "HAVING COUNT(s) < :expectedCount")
    List<Object[]> findIncompleteBatches(@Param("expectedCount") long expectedCount);

    // === MAINTENANCE QUERIES ===

    /**
     * Find summaries that might need updates (business logic dependent)
     */
    @Query("SELECT s FROM Summary s " +
            "WHERE s.createdAt < :cutoffDate " +
            "AND s.modelConfiguration.id IN :outdatedModelConfigs")
    List<Summary> findSummariesNeedingUpdate(
            @Param("cutoffDate") LocalDateTime cutoffDate,
            @Param("outdatedModelConfigs") List<Long> outdatedModelConfigs
    );

    /**
     * Delete summaries older than specified date
     */
    @Query("DELETE FROM Summary s WHERE s.createdAt < :cutoffDate")
    int deleteOldSummaries(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Delete summaries for specific items
     */
    int deleteByItemIdIn(List<Long> itemIds);

    /**
     * Delete summaries from specific batch
     */
    int deleteByBatchId(Long batchId);
}
