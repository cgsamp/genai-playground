package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.model.Relationship;
import net.sampsoftware.genai.repository.RelationshipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RelationshipService {
    private final RelationshipRepository relationshipRepository;

    @Transactional
    public Relationship createRelationship(Relationship relationship) {
        return relationshipRepository.save(relationship);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getRelationshipsForItem(Long itemId) {
        // Find relationships where this item is either source or target
        return relationshipRepository.findByItemId(itemId);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getRelationshipsByType(String relationshipType) {
        return relationshipRepository.findByRelationshipType(relationshipType);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getAllRelationships() {
        return relationshipRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Relationship> getRelationshipsForCollection(Long collectionId) {
        // Get all relationships where target is the collection
        return relationshipRepository.findByTargetItemId(collectionId);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getOutgoingRelationships(Long sourceItemId) {
        return relationshipRepository.findBySourceItemId(sourceItemId);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getIncomingRelationships(Long targetItemId) {
        return relationshipRepository.findByTargetItemId(targetItemId);
    }

    @Transactional
    public void deleteRelationship(Long id) {
        relationshipRepository.deleteById(id);
    }

    @Transactional
    public void deleteRelationshipsForItem(Long itemId) {
        List<Relationship> relationships = getRelationshipsForItem(itemId);
        relationshipRepository.deleteAll(relationships);
    }
}
