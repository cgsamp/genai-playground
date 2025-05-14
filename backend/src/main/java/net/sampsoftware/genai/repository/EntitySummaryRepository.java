package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.dto.EntitySummaryDto;
import net.sampsoftware.genai.model.EntitySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EntitySummaryRepository extends JpaRepository<EntitySummary, Long> {
    // Entity-returning methods
    List<EntitySummary> findByType(String type);

    List<EntitySummary> findByTypeAndEntityIdIn(String type, List<Long> entityIds);

    // Updated query to include full model and configuration details
    @Query("SELECT new net.sampsoftware.genai.dto.EntitySummaryDto(" +
            "e.id, e.entityId, e.summary, " +
            "m.modelName, m.modelProvider, m.id, " +
            "mc.id, mc.modelConfig, mc.comment, " +
            "CAST(e.createdAt as java.time.LocalDateTime)) " +
            "FROM EntitySummary e " +
            "JOIN e.modelConfiguration mc " +
            "JOIN mc.model m " +
            "WHERE e.type = :type")
    List<EntitySummaryDto> findDtosByType(@Param("type") String type);

    @Query("SELECT DISTINCT e.type FROM EntitySummary e")
    List<String> findAllDistinctTypes();

    // Updated query to include full model and configuration details for specific entityIds
    @Query("SELECT new net.sampsoftware.genai.dto.EntitySummaryDto(" +
            "e.id, e.entityId, e.summary, " +
            "m.modelName, m.modelProvider, m.id, " +
            "mc.id, mc.modelConfig, mc.comment, " +
            "CAST(e.createdAt as java.time.LocalDateTime)) " +
            "FROM EntitySummary e " +
            "JOIN e.modelConfiguration mc " +
            "JOIN mc.model m " +
            "WHERE e.type = :type AND e.entityId IN :entityIds")
    List<EntitySummaryDto> findDtosByTypeAndEntityIds(
            @Param("type") String type,
            @Param("entityIds") List<Long> entityIds
    );
}
