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

    List<Relationship> findBySourceItemId(Long sourceItemId);

    List<Relationship> findByTargetItemId(Long targetItemId);

    @Query("SELECT r FROM Relationship r WHERE " +
            "r.sourceItemId = :itemId OR r.targetItemId = :itemId")
    List<Relationship> findByItemId(@Param("itemId") Long itemId);

    List<Relationship> findBySourceItemIdAndRelationshipType(Long sourceItemId, String relationshipType);

    List<Relationship> findByTargetItemIdAndRelationshipType(Long targetItemId, String relationshipType);

    @Query("SELECT r FROM Relationship r WHERE " +
            "r.relationshipType = :relationshipType AND " +
            "(r.sourceItemId = :itemId OR r.targetItemId = :itemId)")
    List<Relationship> findByItemIdAndRelationshipType(
            @Param("itemId") Long itemId,
            @Param("relationshipType") String relationshipType
    );

    // Collection-specific queries
    @Query("SELECT r FROM Relationship r WHERE " +
            "r.targetItemId = :collectionId AND " +
            "r.relationshipType = 'collection'")
    List<Relationship> findCollectionMembers(@Param("collectionId") Long collectionId);

    @Query("SELECT r FROM Relationship r WHERE " +
            "r.targetItemId = :collectionId AND " +
            "r.relationshipType = 'collection_definition'")
    List<Relationship> findCollectionDefinition(@Param("collectionId") Long collectionId);

    // Find relationships between specific items
    @Query("SELECT r FROM Relationship r WHERE " +
            "((r.sourceItemId = :item1Id AND r.targetItemId = :item2Id) OR " +
            " (r.sourceItemId = :item2Id AND r.targetItemId = :item1Id))")
    List<Relationship> findBetweenItems(@Param("item1Id") Long item1Id, @Param("item2Id") Long item2Id);

    // Analytics queries
    @Query("SELECT r.relationshipType, COUNT(r) FROM Relationship r GROUP BY r.relationshipType")
    List<Object[]> countByRelationshipType();

    @Query("SELECT COUNT(DISTINCT r.sourceItemId) + COUNT(DISTINCT r.targetItemId) FROM Relationship r")
    long countDistinctItems();
}
