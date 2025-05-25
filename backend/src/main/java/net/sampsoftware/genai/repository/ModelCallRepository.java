package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.ModelCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ModelCallRepository extends JpaRepository<ModelCall, Long> {

    List<ModelCall> findByModelConfigurationIdOrderByCreatedAtDesc(Long modelConfigurationId);

    List<ModelCall> findByBatchIdOrderByCreatedAtDesc(Long batchId);

    List<ModelCall> findBySuccessOrderByCreatedAtDesc(Boolean success);

    List<ModelCall> findByProviderOrderByCreatedAtDesc(String provider);

    List<ModelCall> findByCreatedAtAfterOrderByCreatedAtDesc(Instant after);

    @Query("SELECT mc FROM ModelCall mc WHERE mc.createdAt BETWEEN :start AND :end ORDER BY mc.createdAt DESC")
    List<ModelCall> findByDateRange(@Param("start") Instant start, @Param("end") Instant end);

    // Count queries
    long countBySuccess(Boolean success);

    long countByProvider(String provider);

    long countByProviderAndSuccess(String provider, Boolean success);

    long countByCreatedAtAfter(Instant after);

    // Performance queries
    @Query("SELECT AVG(mc.durationMs) FROM ModelCall mc WHERE mc.success = true AND mc.modelConfiguration.id = :configId")
    Double getAverageDurationByModelConfig(@Param("configId") Long configId);

    @Query("SELECT AVG(mc.durationMs) FROM ModelCall mc WHERE mc.success = true AND mc.provider = :provider")
    Double getAverageDurationByProvider(@Param("provider") String provider);

    @Query("SELECT AVG(mc.apiDurationMs) FROM ModelCall mc WHERE mc.success = true AND mc.provider = :provider AND mc.apiDurationMs IS NOT NULL")
    Double getAverageApiDurationByProvider(@Param("provider") String provider);

    @Query("SELECT AVG(mc.processingDurationMs) FROM ModelCall mc WHERE mc.success = true AND mc.provider = :provider AND mc.processingDurationMs IS NOT NULL")
    Double getAverageProcessingDurationByProvider(@Param("provider") String provider);

    @Query("SELECT AVG(mc.durationMs) FROM ModelCall mc WHERE mc.success = true")
    Double getOverallAverageResponseTime();

    // Analytics queries
    @Query("SELECT DISTINCT mc.provider FROM ModelCall mc WHERE mc.provider IS NOT NULL ORDER BY mc.provider")
    List<String> findDistinctProviders();

    @Query("SELECT mc.provider, COUNT(mc) FROM ModelCall mc WHERE mc.provider IS NOT NULL GROUP BY mc.provider ORDER BY COUNT(mc) DESC")
    List<Object[]> countCallsByProvider();

    @Query("SELECT mc.modelName, COUNT(mc) FROM ModelCall mc WHERE mc.modelName IS NOT NULL GROUP BY mc.modelName ORDER BY COUNT(mc) DESC")
    List<Object[]> countCallsByModel();

    @Query("SELECT mc.requestContext, COUNT(mc) FROM ModelCall mc WHERE mc.requestContext IS NOT NULL GROUP BY mc.requestContext ORDER BY COUNT(mc) DESC")
    List<Object[]> countCallsByContext();

    // Error analysis queries
    @Query("SELECT mc.errorClass, COUNT(mc) FROM ModelCall mc WHERE mc.success = false AND mc.errorClass IS NOT NULL GROUP BY mc.errorClass ORDER BY COUNT(mc) DESC")
    List<Object[]> countCallsByErrorType();

    @Query("SELECT mc FROM ModelCall mc WHERE mc.success = false AND mc.durationMs > :threshold ORDER BY mc.createdAt DESC")
    List<ModelCall> findFailedCallsWithHighDuration(@Param("threshold") Long threshold);

    // Token usage queries
    @Query("SELECT mc FROM ModelCall mc WHERE mc.tokenUsage IS NOT NULL ORDER BY mc.createdAt DESC")
    List<ModelCall> findCallsWithTokenUsage();

    // Batch analysis
    @Query("SELECT mc.batchId, COUNT(mc), AVG(mc.durationMs), SUM(CASE WHEN mc.success = true THEN 1 ELSE 0 END) " +
            "FROM ModelCall mc WHERE mc.batchId IS NOT NULL " +
            "GROUP BY mc.batchId ORDER BY mc.batchId DESC")
    List<Object[]> getBatchAnalytics();

    // Recent activity
    @Query("SELECT DATE(mc.createdAt), COUNT(mc), AVG(mc.durationMs) " +
            "FROM ModelCall mc WHERE mc.createdAt > :since " +
            "GROUP BY DATE(mc.createdAt) ORDER BY DATE(mc.createdAt) DESC")
    List<Object[]> getDailyActivity(@Param("since") Instant since);
}
