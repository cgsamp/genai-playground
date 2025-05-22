// backend/src/main/java/net/sampsoftware/genai/service/OperationsService.java
package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.*;
import net.sampsoftware.genai.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class OperationsService {

    private final RelationshipRepository relationshipRepository;
    private final SummaryService summaryService;
    private final ModelService modelService;
    private final AIService aiService;

    public record SummarizeEachResult(
            int successCount,
            int failureCount,
            List<Long> summaryIds
    ) {}

    public record SummarizeGroupResult(
            Long summaryId,
            Long collectionId,
            int entityCount
    ) {}

    public record GenerateRelationshipsResult(
            int relationshipCount,
            List<Long> relationshipIds,
            List<Long> summaryIds,
            int entityPairsProcessed
    ) {}

    @Transactional
    public SummarizeEachResult summarizeEachInCollection(Long modelConfigurationId, Long collectionId) {
        log.debug("Summarizing each entity in collection {}", collectionId);

        // Get collection entities using the new repository method
        var collectionEntities = relationshipRepository.findCollectionMembers(collectionId);

        var modelConfiguration = modelService.findConfigurationById(modelConfigurationId);
        var batchId = System.nanoTime();
        var summaryIds = new ArrayList<Long>();

        String systemPrompt = """
            You are analyzing an entity from a collection. Please provide a concise, informative summary 
            of this entity focusing on its key characteristics, significance, and notable features. 
            Keep the summary to 2-3 sentences and make it suitable for comparative analysis with other entities.
            """;

        var futures = new ArrayList<CompletableFuture<Boolean>>();

        for (var relationship : collectionEntities) {
            // For each entity in the collection, create a summary
            try {
                var entityInfo = buildEntityInfo(relationship.getSourceType(), relationship.getSourceId());

                var future = CompletableFuture.supplyAsync(() -> {
                    try {
                        String summaryText = aiService.generateResponse(systemPrompt, entityInfo, modelConfiguration);

                        var summary = Summary.builder()
                                .name(String.format("Summary of %s %d", relationship.getSourceType(), relationship.getSourceId()))
                                .modelConfiguration(modelConfiguration)
                                .entityType(relationship.getSourceType())
                                .entityId(relationship.getSourceId())
                                .content(summaryText)
                                .batchId(batchId)
                                .build();

                        var savedSummary = summaryService.save(summary);
                        synchronized (summaryIds) {
                            summaryIds.add(savedSummary.getId());
                        }
                        return true;
                    } catch (Exception e) {
                        log.error("Failed to create summary for {} {}: {}",
                                relationship.getSourceType(), relationship.getSourceId(), e.getMessage());
                        return false;
                    }
                });

                futures.add(future);
            } catch (Exception e) {
                log.error("Error processing entity {} {}: {}",
                        relationship.getSourceType(), relationship.getSourceId(), e.getMessage());
            }
        }

        // Wait for all futures to complete
        var results = futures.stream()
                .map(CompletableFuture::join)
                .toList();

        int successCount = (int) results.stream().mapToInt(success -> success ? 1 : 0).sum();
        int failureCount = results.size() - successCount;

        log.debug("Completed summarize each: {} success, {} failures", successCount, failureCount);
        return new SummarizeEachResult(successCount, failureCount, summaryIds);
    }

    @Transactional
    public SummarizeGroupResult summarizeCollection(Long modelConfigurationId, Long collectionId) {
        log.debug("Summarizing collection {}", collectionId);

        // Get collection definition and entities using new repository methods
        var collectionDefinitions = relationshipRepository.findCollectionDefinition(collectionId);
        if (collectionDefinitions.isEmpty()) {
            throw new RuntimeException("Collection definition not found for collection " + collectionId);
        }
        var collectionDefinition = collectionDefinitions.get(0);

        var collectionEntities = relationshipRepository.findCollectionMembers(collectionId);

        var modelConfiguration = modelService.findConfigurationById(modelConfigurationId);

        // Build comprehensive collection context
        var collectionContext = buildCollectionContext(collectionDefinition, collectionEntities);

        String systemPrompt = """
            You are analyzing a collection of entities. Please provide a comprehensive summary of this collection, 
            including its theme, the types of entities it contains, common patterns or relationships you observe, 
            and the overall significance or purpose of grouping these entities together. 
            Focus on synthesis and high-level insights rather than listing individual items.
            """;

        String summaryText = aiService.generateResponse(systemPrompt, collectionContext, modelConfiguration);

        var summary = Summary.builder()
                .name(String.format("Collection Summary: %s", collectionDefinition.getName()))
                .modelConfiguration(modelConfiguration)
                .entityType("collection")
                .entityId(collectionId)
                .content(summaryText)
                .build();

        var savedSummary = summaryService.save(summary);

        // Create relationship between summary and collection
        var summaryRelationship = new Relationship();
        summaryRelationship.setName("Summary of Collection");
        summaryRelationship.setRelationshipType("summarizes");
        summaryRelationship.setSourceType("summary");
        summaryRelationship.setSourceId(savedSummary.getId());
        summaryRelationship.setTargetType("collection");
        summaryRelationship.setTargetId(collectionId);
        relationshipRepository.save(summaryRelationship);

        return new SummarizeGroupResult(savedSummary.getId(), collectionId, collectionEntities.size());
    }

    @Transactional
    public GenerateRelationshipsResult generateRelationships(
            Long modelConfigurationId,
            Long collectionId,
            List<String> relationshipTypes
    ) {
        log.debug("Generating relationships for collection {} with types {}", collectionId, relationshipTypes);

        var collectionEntities = relationshipRepository.findCollectionMembers(collectionId);

        var modelConfiguration = modelService.findConfigurationById(modelConfigurationId);
        var relationshipIds = new ArrayList<Long>();
        var summaryIds = new ArrayList<Long>();
        int pairsProcessed = 0;

        String systemPrompt = String.format("""
            You are analyzing the relationship between two entities. 
            Please assess if there is a meaningful relationship between them from these types: %s
            
            Respond with JSON in this format:
            {
              "hasRelationship": true/false,
              "relationshipType": "one of the provided types or null",
              "confidence": 0.0-1.0,
              "explanation": "brief explanation of the relationship or why none exists"
            }
            """, String.join(", ", relationshipTypes));

        // Generate relationships for all pairs of entities
        for (int i = 0; i < collectionEntities.size(); i++) {
            for (int j = i + 1; j < collectionEntities.size(); j++) {
                var entity1 = collectionEntities.get(i);
                var entity2 = collectionEntities.get(j);

                try {
                    var entity1Info = buildEntityInfo(entity1.getSourceType(), entity1.getSourceId());
                    var entity2Info = buildEntityInfo(entity2.getSourceType(), entity2.getSourceId());

                    var prompt = String.format("""
                        Entity 1: %s
                        Entity 2: %s
                        
                        Analyze the relationship between these entities.
                        """, entity1Info, entity2Info);

                    var response = aiService.generateResponse(systemPrompt, prompt, modelConfiguration);

                    // Parse the JSON response and create relationships if found
                    // This is simplified - in practice you'd want robust JSON parsing
                    if (response.contains("\"hasRelationship\": true")) {
                        var relationship = new Relationship();
                        relationship.setName(String.format("AI-Generated relationship between %s %d and %s %d",
                                entity1.getSourceType(), entity1.getSourceId(),
                                entity2.getSourceType(), entity2.getSourceId()));
                        relationship.setRelationshipType(extractRelationshipType(response, relationshipTypes));
                        relationship.setSourceType(entity1.getSourceType());
                        relationship.setSourceId(entity1.getSourceId());
                        relationship.setTargetType(entity2.getSourceType());
                        relationship.setTargetId(entity2.getSourceId());

                        var savedRelationship = relationshipRepository.save(relationship);
                        relationshipIds.add(savedRelationship.getId());

                        // Create a summary of this relationship
                        var relationshipSummary = Summary.builder()
                                .name(String.format("Analysis of relationship %d", savedRelationship.getId()))
                                .modelConfiguration(modelConfiguration)
                                .entityType("relationship")
                                .entityId(savedRelationship.getId())
                                .content(response)
                                .build();

                        var savedSummary = summaryService.save(relationshipSummary);
                        summaryIds.add(savedSummary.getId());
                    }

                    pairsProcessed++;
                } catch (Exception e) {
                    log.error("Error processing relationship between {} {} and {} {}: {}",
                            entity1.getSourceType(), entity1.getSourceId(),
                            entity2.getSourceType(), entity2.getSourceId(), e.getMessage());
                }
            }
        }

        return new GenerateRelationshipsResult(
                relationshipIds.size(),
                relationshipIds,
                summaryIds,
                pairsProcessed
        );
    }

    private String buildEntityInfo(String entityType, Long entityId) {
        // TODO: Expand this to fetch actual entity details from appropriate repositories
        // For now, return basic info - you'll want to implement this based on entity type
        return String.format("Entity Type: %s, ID: %d", entityType, entityId);
    }

    private String buildCollectionContext(Relationship collectionDefinition, List<Relationship> entities) {
        var context = new StringBuilder();
        context.append(String.format("Collection: %s\n", collectionDefinition.getName()));
        context.append(String.format("Description: %s\n",
                collectionDefinition.getAttributes() != null && collectionDefinition.getAttributes().has("description") ?
                        collectionDefinition.getAttributes().get("description").asText() : "No description"));

        context.append(String.format("Entities (%d):\n", entities.size()));
        for (var entity : entities) {
            context.append(String.format("- %s %d\n", entity.getSourceType(), entity.getSourceId()));
        }

        return context.toString();
    }

    private String extractRelationshipType(String aiResponse, List<String> validTypes) {
        // Simple extraction - in practice you'd want proper JSON parsing
        for (String type : validTypes) {
            if (aiResponse.contains(String.format("\"%s\"", type))) {
                return type;
            }
        }
        return validTypes.get(0); // fallback
    }
}
