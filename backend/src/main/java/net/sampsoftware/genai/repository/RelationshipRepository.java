// backend/src/main/java/net/sampsoftware/genai/repository/RelationshipRepository.java
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

    // NEW METHODS NEEDED FOR OPERATIONS:

    /**
     * Find relationships by target type, target ID, and relationship type
     * Used to find collection entities and collection definitions
     */
    List<Relationship> findByTargetTypeAndTargetIdAndRelationshipType(
            String targetType,
            Long targetId,
            String relationshipType
    );

    /**
     * Find relationships by source type, source ID, and relationship type
     * Used for finding outgoing relationships of a specific type
     */
    List<Relationship> findBySourceTypeAndSourceIdAndRelationshipType(
            String sourceType,
            Long sourceId,
            String relationshipType
    );

    /**
     * Find all relationships of a specific type between specific entity types
     * Useful for analyzing patterns
     */
    @Query("SELECT r FROM Relationship r WHERE " +
            "r.relationshipType = :relationshipType AND " +
            "r.sourceType = :sourceType AND " +
            "r.targetType = :targetType")
    List<Relationship> findByRelationshipTypeAndSourceTypeAndTargetType(
            @Param("relationshipType") String relationshipType,
            @Param("sourceType") String sourceType,
            @Param("targetType") String targetType
    );

    /**
     * Find collection members (entities that belong to a collection)
     * This is a convenience method for the common collection query pattern
     */
    @Query("SELECT r FROM Relationship r WHERE " +
            "r.targetType = 'collection' AND " +
            "r.targetId = :collectionId AND " +
            "r.relationshipType = 'collection'")
    List<Relationship> findCollectionMembers(@Param("collectionId") Long collectionId);

    /**
     * Find collection definition for a collection
     * This finds the relationship that defines the collection metadata
     */
    @Query("SELECT r FROM Relationship r WHERE " +
            "r.targetType = 'collection' AND " +
            "r.targetId = :collectionId AND " +
            "r.relationshipType = 'collection_definition'")
    List<Relationship> findCollectionDefinition(@Param("collectionId") Long collectionId);
}
