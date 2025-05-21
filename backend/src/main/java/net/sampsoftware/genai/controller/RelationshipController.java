package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.RelationshipRecord;
import net.sampsoftware.genai.model.Relationship;
import net.sampsoftware.genai.service.RelationshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/relationships")
@RequiredArgsConstructor
public class RelationshipController {
    private final RelationshipService relationshipService;

    @PostMapping
    public ResponseEntity<RelationshipRecord> createRelationship(@RequestBody RelationshipRecord record) {
        Relationship relationship = fromRecord(record);
        Relationship created = relationshipService.createRelationship(relationship);
        return ResponseEntity.ok(toRecord(created));
    }

    @GetMapping("/entity")
    public ResponseEntity<List<RelationshipRecord>> getRelationshipsForEntity(
            @RequestParam String entityType,
            @RequestParam Long entityId) {
        List<Relationship> relationships = relationshipService.getRelationshipsForEntity(entityType, entityId);
        List<RelationshipRecord> records = relationships.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/type/{relationshipType}")
    public ResponseEntity<List<RelationshipRecord>> getRelationshipsByType(
            @PathVariable String relationshipType) {
        List<Relationship> relationships = relationshipService.getRelationshipsByType(relationshipType);
        List<RelationshipRecord> records = relationships.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/type/all")
    public ResponseEntity<List<RelationshipRecord>> getAllRelationships() {
        List<Relationship> relationships = relationshipService.getAllRelationships();
        List<RelationshipRecord> records = relationships.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    private RelationshipRecord toRecord(Relationship relationship) {
        return new RelationshipRecord(
                relationship.getId(),
                relationship.getName(),
                relationship.getRelationshipType(),
                relationship.getSourceType(),
                relationship.getSourceId(),
                relationship.getTargetType(),
                relationship.getTargetId(),
                relationship.getAttributes(),
                relationship.getCreatedAt(),
                relationship.getUpdatedAt()
        );
    }

    private Relationship fromRecord(RelationshipRecord record) {
        Relationship relationship = new Relationship();
        relationship.setName(record.name());
        relationship.setRelationshipType(record.relationshipType());
        relationship.setSourceType(record.sourceType());
        relationship.setSourceId(record.sourceId());
        relationship.setTargetType(record.targetType());
        relationship.setTargetId(record.targetId());
        relationship.setAttributes(record.attributes());
        return relationship;
    }
}
