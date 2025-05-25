package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.SummaryRecords.DetailedSummaryRecord;
import net.sampsoftware.genai.dto.SummaryRecords.SummaryRecord;
import net.sampsoftware.genai.exception.ResourceNotFoundException;
import net.sampsoftware.genai.model.Summary;
import net.sampsoftware.genai.service.SummaryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/summaries")
@RequiredArgsConstructor
@Validated
public class SummaryController {

    private final SummaryService summaryService;

    /**
     * Get summaries for specific items by ID
     */
    @GetMapping("/items")
    public ResponseEntity<List<DetailedSummaryRecord>> getSummariesForItems(
            @RequestParam(required = false) List<Long> itemIds
    ) {
        log.debug("Finding summaries for itemIds: {}", itemIds);
        try {
            // If no itemIds provided or empty list, return all summaries
            if (itemIds == null || itemIds.isEmpty()) {
                log.debug("No itemIds provided, returning all summaries");
                List<DetailedSummaryRecord> summaries = summaryService.findAllDetailedSummaryRecords();
                return ResponseEntity.ok(summaries);
            }

            List<DetailedSummaryRecord> summaries = summaryService.findByItemIds(itemIds);
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error fetching summaries for itemIds: {}", itemIds, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summaries", e);
        }
    }
    /**
     * Get summaries for a single item
     */
    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<DetailedSummaryRecord>> getSummariesForItem(
            @PathVariable Long itemId
    ) {
        log.debug("Finding summaries for itemId: {}", itemId);
        try {
            List<DetailedSummaryRecord> summaries = summaryService.findByItemIds(List.of(itemId));
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error fetching summaries for itemId: {}", itemId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summaries", e);
        }
    }

    /**
     * Get all summaries
     */
    @GetMapping
    public ResponseEntity<List<DetailedSummaryRecord>> getAllSummaries() {
        log.debug("Finding all summaries");
        try {
            List<DetailedSummaryRecord> summaries = summaryService.findAllDetailedSummaryRecords();
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error fetching all summaries", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summaries", e);
        }
    }

    /**
     * Get summaries by batch ID
     */
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<DetailedSummaryRecord>> getSummariesByBatch(
            @PathVariable Long batchId
    ) {
        log.debug("Finding summaries for batchId: {}", batchId);
        try {
            List<DetailedSummaryRecord> summaries = summaryService.findByBatchId(batchId);
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error fetching summaries for batchId: {}", batchId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summaries", e);
        }
    }

    /**
     * Get summaries by model configuration
     */
    @GetMapping("/model-config/{modelConfigId}")
    public ResponseEntity<List<DetailedSummaryRecord>> getSummariesByModelConfig(
            @PathVariable Long modelConfigId
    ) {
        log.debug("Finding summaries for modelConfigId: {}", modelConfigId);
        try {
            List<DetailedSummaryRecord> summaries = summaryService.findByModelConfigurationId(modelConfigId);
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error fetching summaries for modelConfigId: {}", modelConfigId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summaries", e);
        }
    }

    /**
     * Get summary statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<SummaryStats> getSummaryStats() {
        log.debug("Fetching summary statistics");
        try {
            SummaryStats stats = summaryService.getSummaryStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching summary statistics", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summary statistics", e);
        }
    }

    /**
     * Create a new summary
     */
    @PostMapping
    public ResponseEntity<SummaryRecord> createSummary(@RequestBody @Validated Summary summary) {
        log.debug("Creating new summary for item: {}", summary.getItemId());
        try {
            SummaryRecord created = summaryService.create(summary);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Error creating summary", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating summary", e);
        }
    }

    /**
     * Update an existing summary
     */
    @PutMapping("/{id}")
    public ResponseEntity<SummaryRecord> updateSummary(@PathVariable Long id, @RequestBody @Validated Summary summary) {
        log.debug("Updating summary with ID: {}", id);
        try {
            summary.setId(id);
            SummaryRecord updated = summaryService.update(summary);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            log.warn("Update Summary not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating summary with ID: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating summary", e);
        }
    }

    /**
     * Delete a summary
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSummary(@PathVariable Long id) {
        log.debug("Deleting summary with ID: {}", id);
        try {
            summaryService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            log.warn("Delete Summary not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting summary with ID: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting summary", e);
        }
    }




    // Add these records inside SummaryController class
    public record SummaryStats(
            int totalSummaries,
            int totalItems,
            int totalBatches,
            List<ModelSummaryCount> modelCounts,
            List<BatchSummaryCount> recentBatches
    ) {}

    public record ModelSummaryCount(
            Long modelId,
            String modelName,
            int count
    ) {}

    public record BatchSummaryCount(
            Long batchId,
            int count,
            String createdAt
    ) {}
}
