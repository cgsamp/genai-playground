package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.BatchSummaryResponse;
import net.sampsoftware.genai.model.Item;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.model.Summary;
import net.sampsoftware.genai.repository.ItemRepository;
import net.sampsoftware.genai.repository.RelationshipRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncItemSummaryService {

    private final AIService aiService;
    private final ModelService modelService;
    private final ItemRepository itemRepository;
    private final RelationshipRepository relationshipRepository;
    private final AsyncItemProcessor asyncItemProcessor;

    /**
     * Generate summaries for all items, optionally filtered by type
     */
    public BatchSummaryResponse generateSummariesForAllItems(
            String prompt,
            Long modelConfigurationId,
            List<String> itemTypes
    ) {
        Long batchId = System.nanoTime();

        log.debug("Processing all items with batch ID {}, types: {}", batchId, itemTypes);

        // Get items, filtered by type if specified
        List<Item> items = (itemTypes == null || itemTypes.isEmpty())
            ? itemRepository.findAll()
            : itemRepository.findByItemTypeIn(itemTypes);

        return processItems(items, prompt, modelConfigurationId, batchId);
    }

    /**
     * Generate summaries for specific items by ID
     */
    public BatchSummaryResponse generateSummariesForItems(
            List<Long> itemIds,
            String prompt,
            Long modelConfigurationId
    ) {
        Long batchId = System.nanoTime();

        log.debug("Processing {} specific items with batch ID {}", itemIds.size(), batchId);

        List<Item> items = itemRepository.findAllById(itemIds);

        if (items.size() != itemIds.size()) {
            log.warn("Found {} items but requested {}", items.size(), itemIds.size());
        }

        return processItems(items, prompt, modelConfigurationId, batchId);
    }

    /**
     * Generate summaries for items in a collection
     */
    public BatchSummaryResponse generateSummariesForCollection(
            Long collectionId,
            String prompt,
            Long modelConfigurationId
    ) {
        Long batchId = System.nanoTime();

        log.debug("Processing collection {} with batch ID {}", collectionId, batchId);

        // Get collection members using the relationship model
        var collectionRelationships = relationshipRepository.findCollectionMembers(collectionId);

        List<Long> itemIds = collectionRelationships.stream()
                .map(rel -> rel.getSourceItemId())  // Updated for new Relationship model
                .collect(Collectors.toList());

        List<Item> items = itemRepository.findAllById(itemIds);

        return processItems(items, prompt, modelConfigurationId, batchId);
    }

    /**
     * Core processing logic for any list of items
     */
    private BatchSummaryResponse processItems(
            List<Item> items,
            String prompt,
            Long modelConfigurationId,
            Long batchId
    ) {
        if (items.isEmpty()) {
            return new BatchSummaryResponse(0, 0, List.of(), "No items to process");
        }

        String systemPrompt = buildSystemPrompt(prompt);
        ModelConfiguration modelConfiguration = modelService.findConfigurationById(modelConfigurationId);

        log.debug("Processing {} items with batch ID {}", items.size(), batchId);

        // Process all items asynchronously
        List<CompletableFuture<AsyncItemProcessor.ProcessingResult>> futures = items.stream()
                .map(item -> asyncItemProcessor.processItemAsync(
                        item,
                        systemPrompt,
                        modelConfiguration,
                        batchId
                ))
                .collect(Collectors.toList());

        // Wait for all processing to complete
        List<AsyncItemProcessor.ProcessingResult> results = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        // Collect results
        List<Long> summaryIds = results.stream()
                .filter(AsyncItemProcessor.ProcessingResult::success)
                .map(AsyncItemProcessor.ProcessingResult::summaryId)
                .collect(Collectors.toList());

        int successCount = (int) results.stream().mapToInt(r -> r.success() ? 1 : 0).sum();
        int failureCount = results.size() - successCount;

        log.debug("Completed batch {}: {} successes, {} failures", batchId, successCount, failureCount);

        String message = String.format("Processed %d items: %d succeeded, %d failed",
                results.size(), successCount, failureCount);

        return new BatchSummaryResponse(successCount, failureCount, summaryIds, message);
    }

    /**
     * Build system prompt for item summarization
     */
    private String buildSystemPrompt(String userPrompt) {
        if (userPrompt != null && !userPrompt.trim().isEmpty()) {
            return userPrompt;
        }

        return """
            You are analyzing an item from a collection. The item details will be provided as JSON.
            Please provide a concise, informative summary of this item focusing on its key
            characteristics, significance, and notable features. Keep the summary to 2-3 sentences
            and make it suitable for comparative analysis with other items.

            For books: focus on genre, themes, and literary significance.
            For people: focus on their role, achievements, and historical importance.
            For other items: focus on their primary characteristics and relevance.
            """;
    }
}
