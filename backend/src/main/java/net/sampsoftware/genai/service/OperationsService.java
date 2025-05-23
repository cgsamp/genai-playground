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
    private final ItemRepository itemRepository;
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
        log.debug("Summarizing each item in collection {}", collectionId);

        // Get collection items using the unified Item model
        var collectionItems = relationshipRepository.findCollectionMembers(collectionId);

        var modelConfiguration = modelService.findConfigurationById(modelConfigurationId);
        var batchId = System.nanoTime();
        var summaryIds = new ArrayList<Long>();

        String systemPrompt = """
            You are analyzing an item from a collection. Please provide a concise, informative summary
            of this item focusing on its key characteristics, significance, and notable features.
            Keep the summary to 2-3 sentences and make it suitable for comparative analysis with other items.
            """;

        var futures = new ArrayList<CompletableFuture<Boolean>>();

        for (var relationship : collectionItems) {
            // Each relationship points to an item in the collection
            Long itemId = relationship.getSourceItemId();

            try {
                var itemInfo = buildItemInfo(itemId);

                var future = CompletableFuture.supplyAsync(() -> {
                    try {
                        String summaryText = aiService.generateResponse(systemPrompt, itemInfo, modelConfiguration);

                        var summary = Summary.builder()
                                .modelConfiguration(modelConfiguration)
                                .itemId(itemId)
                                .content(summaryText)
                                .batchId(batchId)
                                .build();

                        var savedSummary = summaryService.save(summary);
                        synchronized (summaryIds) {
                            summaryIds.add(savedSummary.getId());
                        }
                        return true;
                    } catch (Exception e) {
                        log.error("Failed to create summary for item {}: {}", itemId, e.getMessage());
                        return false;
                    }
                });

                futures.add(future);
            } catch (Exception e) {
                log.error("Error processing item {}: {}", itemId, e.getMessage());
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

        // Get collection definition and items
        var collectionDefinitions = relationshipRepository.findCollectionDefinition(collectionId);
        if (collectionDefinitions.isEmpty()) {
            throw new RuntimeException("Collection definition not found for collection " + collectionId);
        }
        var collectionDefinition = collectionDefinitions.getFirst();

        var collectionItems = relationshipRepository.findCollectionMembers(collectionId);

        var modelConfiguration = modelService.findConfigurationById(modelConfigurationId);

        // Build comprehensive collection context
        var collectionContext = buildCollectionContext(collectionDefinition, collectionItems);

        String systemPrompt = """
            You are analyzing a collection of items. Please provide a comprehensive summary of this collection,
            including its theme, the types of items it contains, common patterns or relationships you observe,
            and the overall significance or purpose of grouping these items together.
            Focus on synthesis and high-level insights rather than listing individual items.
            """;

        String summaryText = aiService.generateResponse(systemPrompt, collectionContext, modelConfiguration);

        var summary = Summary.builder()
                .modelConfiguration(modelConfiguration)
                .itemId(collectionId)  // Collection itself is an item
                .content(summaryText)
                .build();

        var savedSummary = summaryService.save(summary);

        // Create relationship between summary and collection
        var summaryRelationship = new Relationship();
        summaryRelationship.setName("Summary of Collection");
        summaryRelationship.setRelationshipType("summarizes");
        summaryRelationship.setSourceItemId(savedSummary.getId());  // Summary as source
        summaryRelationship.setTargetItemId(collectionId);          // Collection as target
        relationshipRepository.save(summaryRelationship);

        return new SummarizeGroupResult(savedSummary.getId(), collectionId, collectionItems.size());
    }

    @Transactional
    public GenerateRelationshipsResult generateRelationships(
            Long modelConfigurationId,
            Long collectionId,
            List<String> relationshipTypes
    ) {
        log.debug("Generating relationships for collection {} with types {}", collectionId, relationshipTypes);

        var collectionItems = relationshipRepository.findCollectionMembers(collectionId);

        var modelConfiguration = modelService.findConfigurationById(modelConfigurationId);
        var relationshipIds = new ArrayList<Long>();
        var summaryIds = new ArrayList<Long>();
        int pairsProcessed = 0;

        String systemPrompt = String.format("""
            You are analyzing the relationship between two items.
            Please assess if there is a meaningful relationship between them from these types: %s
            
            Respond with JSON in this format:
            {
              "hasRelationship": true/false,
              "relationshipType": "one of the provided types or null",
              "confidence": 0.0-1.0,
              "explanation": "brief explanation of the relationship or why none exists"
            }
            """, String.join(", ", relationshipTypes));

        // Generate relationships for all pairs of items
        for (int i = 0; i < collectionItems.size(); i++) {
            for (int j = i + 1; j < collectionItems.size(); j++) {
                var item1 = collectionItems.get(i);
                var item2 = collectionItems.get(j);

                try {
                    var item1Info = buildItemInfo(item1.getSourceItemId());
                    var item2Info = buildItemInfo(item2.getSourceItemId());

                    var prompt = String.format("""
                        Item 1: %s
                        Item 2: %s
                        
                        Analyze the relationship between these items.
                        """, item1Info, item2Info);

                    var response = aiService.generateResponse(systemPrompt, prompt, modelConfiguration);

                    // Parse the JSON response and create relationships if found
                    if (response.contains("\"hasRelationship\": true")) {
                        var relationship = new Relationship();
                        relationship.setName(String.format("AI-Generated relationship between items %d and %d",
                                item1.getSourceItemId(), item2.getSourceItemId()));
                        relationship.setRelationshipType(extractRelationshipType(response, relationshipTypes));
                        relationship.setSourceItemId(item1.getSourceItemId());
                        relationship.setTargetItemId(item2.getSourceItemId());

                        var savedRelationship = relationshipRepository.save(relationship);
                        relationshipIds.add(savedRelationship.getId());

                        // Create a summary of this relationship analysis
                        var relationshipSummary = Summary.builder()
                                .modelConfiguration(modelConfiguration)
                                .itemId(savedRelationship.getId())  // Relationship as an item
                                .content(response)
                                .build();

                        var savedSummary = summaryService.save(relationshipSummary);
                        summaryIds.add(savedSummary.getId());
                    }

                    pairsProcessed++;
                } catch (Exception e) {
                    log.error("Error processing relationship between items {} and {}: {}",
                            item1.getSourceItemId(), item2.getSourceItemId(), e.getMessage());
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

    // === HELPER METHODS ===

    /**
     * Build item information for AI processing
     */
    private String buildItemInfo(Long itemId) {
        try {
            var itemOpt = itemRepository.findById(itemId);
            if (itemOpt.isEmpty()) {
                return String.format("Item ID: %d (not found)", itemId);
            }

            var item = itemOpt.get();
            StringBuilder info = new StringBuilder();

            info.append(String.format("Item ID: %d\n", item.getId()));
            info.append(String.format("Name: %s\n", item.getName()));
            info.append(String.format("Type: %s\n", item.getItemType()));

            // Check if attributes exist and are not null/empty
            if (item.getAttributes() != null && !item.getAttributes().isNull() && !item.getAttributes().isEmpty()) {
                info.append("Attributes:\n");
                var attributes = item.getAttributes();
                attributes.fieldNames().forEachRemaining(field -> {
                    var value = attributes.get(field);
                    info.append(String.format("- %s: %s\n", field, value.asText()));
                });
            }

            return info.toString();
        } catch (Exception e) {
            log.warn("Error building item info for item {}: {}", itemId, e.getMessage());
            return String.format("Item ID: %d (error retrieving details)", itemId);
        }
    }

    /**
     * Build collection context for AI processing
     */
    private String buildCollectionContext(Relationship collectionDefinition, List<Relationship> items) {
        var context = new StringBuilder();
        context.append(String.format("Collection: %s\n", collectionDefinition.getName()));

        if (collectionDefinition.hasAttributes()) {
            var attrs = collectionDefinition.getAttributes();
            if (attrs.has("description")) {
                context.append(String.format("Description: %s\n", attrs.get("description").asText()));
            }
            if (attrs.has("curator")) {
                context.append(String.format("Curator: %s\n", attrs.get("curator").asText()));
            }
        }

        context.append(String.format("Items (%d):\n", items.size()));
        for (var item : items) {
            context.append(String.format("- Item ID: %d\n", item.getSourceItemId()));
        }

        return context.toString();
    }

    /**
     * Extract relationship type from AI response
     */
    private String extractRelationshipType(String aiResponse, List<String> validTypes) {
        // Simple extraction - in practice you'd want proper JSON parsing
        for (String type : validTypes) {
            if (aiResponse.contains(String.format("\"%s\"", type))) {
                return type;
            }
        }
        return validTypes.getFirst(); // fallback
    }
}
