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

    // Entity-returning methods - updated to match what you're saving
    List<EntitySummary> findByType(String type);
    
    List<EntitySummary> findByTypeAndEntityIdIn(String type, List<Long> entityIds);
    
    // DTO-returning methods with explicit JPQL - updated for debugging
    @Query("SELECT new net.sampsoftware.genai.dto.EntitySummaryDto(" +
           "e.id, e.entityId, e.summary, " +
           "m.modelName, " +
           "CAST(e.createdAt as java.time.LocalDateTime)) " +
           "FROM EntitySummary e " +
           "JOIN e.modelConfiguration mc " +
           "JOIN mc.model m " +
           "WHERE e.type = :type")
    List<EntitySummaryDto> findDtosByType(@Param("type") String type);
    
    // Add a debugging query to see what types exist
    @Query("SELECT DISTINCT e.type FROM EntitySummary e")
    List<String> findAllDistinctTypes();
    
    // Update your main query - ensure it matches what you're saving
    @Query("SELECT new net.sampsoftware.genai.dto.EntitySummaryDto(" +
           "e.id, e.entityId, e.summary, " +
           "m.modelName, " +
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