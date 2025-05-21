package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Relationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, Long> {
    List<Relationship> findByRelationshipType(String relationshipType);

    List<Relationship> findBySourceTypeAndSourceId(String sourceType, Long sourceId);

    List<Relationship> findByTargetTypeAndTargetId(String targetType, Long targetId);

    @Query("SELECT r FROM Relationship r WHERE " +
            "(r.sourceType = :entityType AND r.sourceId = :entityId) OR " +
            "(r.targetType = :entityType AND r.targetId = :entityId)")
    List<Relationship> findByEntity(@Param("entityType") String entityType,
                                    @Param("entityId") Long entityId);
}
