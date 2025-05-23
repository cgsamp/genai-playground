package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.CytoscapeDto;
import net.sampsoftware.genai.service.CytoscapeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cytoscape")
@RequiredArgsConstructor
public class CytoscapeController {

    private final CytoscapeService cytoscapeService;

    /**
     * Get graph of all items and their summaries
     */
    @GetMapping("/items-summaries")
    public ResponseEntity<CytoscapeDto> getItemsSummariesGraph() {
        log.debug("Requested items-summaries graph");
        try {
            CytoscapeDto graph = cytoscapeService.getItemsSummariesGraph();
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            log.error("Error generating items-summaries graph: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get graph showing relationships between items
     */
    @GetMapping("/items-relationships")
    public ResponseEntity<CytoscapeDto> getItemsRelationshipsGraph() {
        log.debug("Requested items-relationships graph");
        try {
            CytoscapeDto graph = cytoscapeService.getItemsRelationshipsGraph();
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            log.error("Error generating items-relationships graph: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get graph for a specific collection of items
     */
    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<CytoscapeDto> getCollectionGraph(@PathVariable Long collectionId) {
        log.debug("Requested collection graph for collection {}", collectionId);
        try {
            CytoscapeDto graph = cytoscapeService.getCollectionGraph(collectionId);
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            log.error("Error generating collection graph for {}: {}", collectionId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get graph filtered by item types
     */
    @GetMapping("/items-by-type")
    public ResponseEntity<CytoscapeDto> getGraphByItemTypes(
            @RequestParam List<String> itemTypes,
            @RequestParam(defaultValue = "false") boolean includeRelationships) {

        log.debug("Requested graph for item types: {} (relationships: {})", itemTypes, includeRelationships);
        try {
            CytoscapeDto graph = cytoscapeService.getGraphByItemTypes(itemTypes, includeRelationships);
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            log.error("Error generating graph for item types {}: {}", itemTypes, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get graph for items with summaries from a specific model
     */
    @GetMapping("/model/{modelId}")
    public ResponseEntity<CytoscapeDto> getGraphByModel(@PathVariable Long modelId) {
        log.debug("Requested graph for model {}", modelId);
        try {
            CytoscapeDto graph = cytoscapeService.getGraphByModel(modelId);
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            log.error("Error generating graph for model {}: {}", modelId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get comprehensive graph with items, summaries, and relationships
     */
    @GetMapping("/comprehensive")
    public ResponseEntity<CytoscapeDto> getComprehensiveGraph(
            @RequestParam(defaultValue = "100") int maxItems,
            @RequestParam(required = false) List<String> itemTypes) {

        log.debug("Requested comprehensive graph (maxItems: {}, types: {})", maxItems, itemTypes);
        try {
            CytoscapeDto graph = cytoscapeService.getComprehensiveGraph(maxItems, itemTypes);
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            log.error("Error generating comprehensive graph: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available item types for filtering
     */
    @GetMapping("/item-types")
    public ResponseEntity<List<String>> getAvailableItemTypes() {
        log.debug("Requested available item types");
        try {
            List<String> itemTypes = cytoscapeService.getAvailableItemTypes();
            return ResponseEntity.ok(itemTypes);
        } catch (Exception e) {
            log.error("Error getting available item types: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get statistics about the graph data
     */
    @GetMapping("/stats")
    public ResponseEntity<GraphStats> getGraphStats() {
        log.debug("Requested graph statistics");
        try {
            GraphStats stats = cytoscapeService.getGraphStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting graph stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Statistics about the graph data
     */
    public record GraphStats(
            int totalItems,
            int totalSummaries,
            int totalRelationships,
            int totalCollections,
            List<ItemTypeCount> itemTypeCounts
    ) {}

    /**
     * Count of items by type
     */
    public record ItemTypeCount(
            String itemType,
            int count
    ) {}
}
