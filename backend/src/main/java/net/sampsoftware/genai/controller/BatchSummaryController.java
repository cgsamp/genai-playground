package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.BatchSummaryRequest;
import net.sampsoftware.genai.dto.BatchSummaryResponse;
import net.sampsoftware.genai.service.AsyncItemSummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/batch-summary")
@RequiredArgsConstructor
public class BatchSummaryController {

    private final AsyncItemSummaryService itemSummaryService;

    /**
     * Generate summaries for all items of specified types
     */
    @PostMapping
    public ResponseEntity<BatchSummaryResponse> generateSummaries(@RequestBody BatchSummaryRequest request) {
        log.debug("Starting batch summary generation with model config {}", request.modelConfigurationId());

        try {
            BatchSummaryResponse response = itemSummaryService.generateSummariesForAllItems(
                    request.prompt(),
                    request.modelConfigurationId(),
                    request.itemTypes()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating batch summaries: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new BatchSummaryResponse(0, 1, List.of(), e.getMessage()));
        }
    }

    /**
     * Generate summaries for specific items by ID
     */
    @PostMapping("/items")
    public ResponseEntity<BatchSummaryResponse> generateSummariesForItems(
            @RequestBody BatchSummaryForItemsRequest request) {

        log.debug("Starting batch summary generation for {} specific items", request.itemIds().size());

        try {
            BatchSummaryResponse response = itemSummaryService.generateSummariesForItems(
                    request.itemIds(),
                    request.prompt(),
                    request.modelConfigurationId()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating summaries for specific items: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new BatchSummaryResponse(0, 1, List.of(), e.getMessage()));
        }
    }

    /**
     * Generate summaries for items in a collection
     */
    @PostMapping("/collection/{collectionId}")
    public ResponseEntity<BatchSummaryResponse> generateSummariesForCollection(
            @PathVariable Long collectionId,
            @RequestBody BatchSummaryForCollectionRequest request) {

        log.debug("Starting batch summary generation for collection {}", collectionId);

        try {
            BatchSummaryResponse response = itemSummaryService.generateSummariesForCollection(
                    collectionId,
                    request.prompt(),
                    request.modelConfigurationId()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating summaries for collection {}: {}", collectionId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new BatchSummaryResponse(0, 1, List.of(), e.getMessage()));
        }
    }

    // Request DTOs

    /**
     * Request for summarizing specific items
     */
    record BatchSummaryForItemsRequest(
            List<Long> itemIds,
            String prompt,
            Long modelConfigurationId
    ) {}

    /**
     * Request for summarizing items in a collection
     */
    record BatchSummaryForCollectionRequest(
            String prompt,
            Long modelConfigurationId
    ) {}
}
