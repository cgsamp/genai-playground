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

    @GetMapping("/entity/{entityType}")
    public ResponseEntity<List<DetailedSummaryRecord>> getSummariesForEntity(
            @PathVariable String entityType,
            @RequestParam List<Long> entityIds
    ) {
        log.debug("Finding summaries for entityType: {}, entityIds: {}", entityType, entityIds);
        try {
            if (entityType == null || entityType.isBlank()) {
                return ResponseEntity.badRequest().build();
            }
            if (entityIds == null || entityIds.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            List<DetailedSummaryRecord> summaries = summaryService.findByEntityTypeAndIds(entityType, entityIds);
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error fetching summaries for entityType: {}, entityIds: {}", entityType, entityIds, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summaries", e);
        }
    }

    @GetMapping()
    public ResponseEntity<List<DetailedSummaryRecord>> getSummaries(
    ) {
        log.debug("Finding summaries");
        try {
            List<DetailedSummaryRecord> summaries = summaryService.findAllDetailedSummaryRecords();
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error fetching summaries", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching summaries", e);
        }
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAllEntityTypes() {
        log.debug("Fetching all entity types");
        try {
            List<String> types = summaryService.findAllEntityTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            log.error("Error fetching entity types", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching entity types", e);
        }
    }

    @PostMapping
    public ResponseEntity<SummaryRecord> createSummary(@RequestBody @Validated Summary summary) {
        log.debug("Creating new summary: {}", summary);
        try {
            SummaryRecord created = summaryService.create(summary);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Error creating summary", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating summary", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SummaryRecord> updateSummary(@PathVariable Long id, @RequestBody @Validated Summary summary) {
        log.debug("Updating summary with ID: {}", id);
        try {
            summary.setId(id);
            SummaryRecord updated = summaryService.update(summary);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            log.warn("Put, Summary not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating summary with ID: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating summary", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSummary(@PathVariable Long id) {
        log.debug("Deleting summary with ID: {}", id);
        try {
            summaryService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            log.warn("Delete, Summary not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting summary with ID: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting summary", e);
        }
    }
}
