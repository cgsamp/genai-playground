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

    @Query("SELECT mc FROM ModelCall mc WHERE mc.createdAt BETWEEN :start AND :end ORDER BY mc.createdAt DESC")
    List<ModelCall> findByDateRange(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT AVG(mc.durationMs) FROM ModelCall mc WHERE mc.success = true AND mc.modelConfiguration.id = :configId")
    Double getAverageDurationByModelConfig(@Param("configId") Long configId);

    @Query("SELECT AVG(mc.durationMs) FROM ModelCall mc WHERE mc.success = true AND mc.provider = :provider")
    Double getAverageDurationByProvider(@Param("provider") String provider);

    @Query("SELECT COUNT(mc) FROM ModelCall mc WHERE mc.provider = :provider AND mc.success = :success")
    Long countByProviderAndSuccess(@Param("provider") String provider, @Param("success") Boolean success);
}
