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
    public List<Relationship> getRelationshipsForEntity(String entityType, Long entityId) {
        return relationshipRepository.findByEntity(entityType, entityId);
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
    public List<Relationship> getOutgoingRelationships(String sourceType, Long sourceId) {
        return relationshipRepository.findBySourceTypeAndSourceId(sourceType, sourceId);
    }

    @Transactional(readOnly = true)
    public List<Relationship> getIncomingRelationships(String targetType, Long targetId) {
        return relationshipRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }
}
