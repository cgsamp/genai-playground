package net.sampsoftware.genai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.Item;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.model.Summary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncItemProcessor {

    private final AIService aiService;
    private final SummaryService summaryService;
    private final ObjectMapper objectMapper;

    /**
     * Result of processing an item
     */
    public record ProcessingResult(
            boolean success,
            Long itemId,
            Long summaryId,
            String error
    ) {}

    @Async
    public CompletableFuture<ProcessingResult> processItemAsync(
            Item item,
            String systemPrompt,
            ModelConfiguration modelConfiguration,
            Long batchId
    ) {
        try {
            log.debug("Processing item {} (type: {}) in batch {}",
                    item.getId(), item.getItemType(), batchId);

            // Build item info as JSON for the AI
            String itemInfo = buildItemInfo(item);

            // Generate summary using AI
            String summaryText = aiService.generateResponse(
                    systemPrompt,
                    itemInfo,
                    modelConfiguration
            );

            log.debug("Generated summary for item {} (length: {})",
                    item.getId(), summaryText.length());

            // Create and save summary
            Summary summary = Summary.builder()
                    .modelConfiguration(modelConfiguration)
                    .itemId(item.getId())
                    .content(summaryText)
                    .batchId(batchId)
                    .build();

            Summary savedSummary = summaryService.save(summary);

            log.debug("Saved summary {} for item {} in batch {}",
                    savedSummary.getId(), item.getId(), batchId);

            return CompletableFuture.completedFuture(
                    new ProcessingResult(true, item.getId(), savedSummary.getId(), null)
            );

        } catch (Exception e) {
            log.error("Error processing item {} in batch {}: {}",
                    item.getId(), batchId, e.getMessage(), e);

            return CompletableFuture.completedFuture(
                    new ProcessingResult(false, item.getId(), null, e.getMessage())
            );
        }
    }

    /**
     * Build structured item information for AI processing
     */
    private String buildItemInfo(Item item) {
        try {
            // Create a structured representation of the item
            var itemData = objectMapper.createObjectNode();

            itemData.put("id", item.getId());
            itemData.put("name", item.getName());
            itemData.put("type", item.getItemType());

            // Add attributes if present
            if (item.getAttributes() != null) {
                itemData.set("attributes", item.getAttributes());
            }

            // Format as readable JSON
            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(itemData);

        } catch (Exception e) {
            log.warn("Error building JSON for item {}, falling back to simple format: {}",
                    item.getId(), e.getMessage());

            // Fallback to simple string format
            return String.format("""
                Item Details:
                - ID: %d
                - Name: %s  
                - Type: %s
                - Attributes: %s
                """,
                    item.getId(),
                    item.getName(),
                    item.getItemType(),
                    item.getAttributes() != null ? item.getAttributes().toString() : "none"
            );
        }
    }
}
