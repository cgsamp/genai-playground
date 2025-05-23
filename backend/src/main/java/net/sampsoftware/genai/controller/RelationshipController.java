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

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<RelationshipRecord>> getRelationshipsForItem(
            @PathVariable Long itemId) {
        List<Relationship> relationships = relationshipService.getRelationshipsForItem(itemId);
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

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<List<RelationshipRecord>> getCollectionRelationships(
            @PathVariable Long collectionId) {
        // Get all relationships for this collection (both members and definition)
        List<Relationship> relationships = relationshipService.getRelationshipsForCollection(collectionId);
        List<RelationshipRecord> records = relationships.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @GetMapping
    public ResponseEntity<List<RelationshipRecord>> getAllRelationships() {
        List<Relationship> relationships = relationshipService.getAllRelationships();
        List<RelationshipRecord> records = relationships.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRelationship(@PathVariable Long id) {
        relationshipService.deleteRelationship(id);
        return ResponseEntity.noContent().build();
    }

    private RelationshipRecord toRecord(Relationship relationship) {
        return new RelationshipRecord(
                relationship.getId(),
                relationship.getName(),
                relationship.getRelationshipType(),
                relationship.getSourceItemId(),
                relationship.getTargetItemId(),
                relationship.getAttributes(),
                relationship.getCreatedAt(),
                relationship.getUpdatedAt()
        );
    }

    private Relationship fromRecord(RelationshipRecord record) {
        Relationship relationship = new Relationship();
        relationship.setName(record.name());
        relationship.setRelationshipType(record.relationshipType());
        relationship.setSourceItemId(record.sourceItemId());
        relationship.setTargetItemId(record.targetItemId());
        relationship.setAttributes(record.attributes());
        return relationship;
    }
}
