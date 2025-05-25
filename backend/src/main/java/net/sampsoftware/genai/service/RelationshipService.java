package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.Relationship;
import net.sampsoftware.genai.repository.RelationshipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RelationshipService {
    private final RelationshipRepository relationshipRepository;

    @Transactional
    public Relationship createRelationship(Relationship relationship) {
        log.debug("Creating relationship: {} -> {}",
                relationship.getSourceItemId(), relationship.getTargetItemId());
        return relationshipRepository.save(relationship);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getRelationshipsForItem(Long itemId) {
        log.debug("Finding relationships for item: {}", itemId);
        return relationshipRepository.findByItemId(itemId);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getRelationshipsByType(String relationshipType) {
        log.debug("Finding relationships of type: {}", relationshipType);
        return relationshipRepository.findByRelationshipType(relationshipType);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getAllRelationships() {
        log.debug("Finding all relationships");
        return relationshipRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Relationship> getRelationshipsForCollection(Long collectionId) {
        log.debug("Finding relationships for collection: {}", collectionId);
        return relationshipRepository.findByTargetItemId(collectionId);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getOutgoingRelationships(Long sourceItemId) {
        log.debug("Finding outgoing relationships for item: {}", sourceItemId);
        return relationshipRepository.findBySourceItemId(sourceItemId);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getIncomingRelationships(Long targetItemId) {
        log.debug("Finding incoming relationships for item: {}", targetItemId);
        return relationshipRepository.findByTargetItemId(targetItemId);
    }

    @Transactional
    public void deleteRelationship(Long id) {
        log.debug("Deleting relationship: {}", id);
        if (!relationshipRepository.existsById(id)) {
            throw new RuntimeException("Relationship not found with id: " + id);
        }
        relationshipRepository.deleteById(id);
    }

    @Transactional
    public void deleteRelationshipsForItem(Long itemId) {
        log.debug("Deleting all relationships for item: {}", itemId);
        List<Relationship> relationships = getRelationshipsForItem(itemId);
        relationshipRepository.deleteAll(relationships);
    }
}
