package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.controller.CytoscapeController.GraphStats;
import net.sampsoftware.genai.controller.CytoscapeController.ItemTypeCount;
import net.sampsoftware.genai.dto.CytoscapeDto;
import net.sampsoftware.genai.dto.SummaryRecords.DetailedSummaryRecord;
import net.sampsoftware.genai.model.Item;
import net.sampsoftware.genai.model.Relationship;
import net.sampsoftware.genai.repository.ItemRepository;
import net.sampsoftware.genai.repository.RelationshipRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CytoscapeService {

    private final ItemRepository itemRepository;
    private final SummaryService summaryService;
    private final RelationshipRepository relationshipRepository;

    /**
     * Generate a Cytoscape graph of items and their summaries
     */
    public CytoscapeDto getItemsSummariesGraph() {
        log.debug("Generating items-summaries graph");

        // Get all items
        List<Item> items = itemRepository.findAll();
        List<Long> itemIds = items.stream()
                .map(Item::getId)
                .toList();

        log.debug("Found {} items", items.size());

        // Get summaries for these items
        List<DetailedSummaryRecord> summaries = summaryService.findAllDetailedSummaryRecords()
                .stream()
                .filter(summary -> itemIds.contains(summary.itemId()))
                .collect(Collectors.toList());

        log.debug("Found {} summaries", summaries.size());

        return buildItemsSummariesGraph(items, summaries);
    }

    /**
     * Generate a graph focused on relationships between items
     */
    public CytoscapeDto getItemsRelationshipsGraph() {
        log.debug("Generating items-relationships graph");

        // Get all items and relationships
        List<Item> items = itemRepository.findAll();
        List<Relationship> relationships = relationshipRepository.findAll();

        log.debug("Found {} items and {} relationships", items.size(), relationships.size());

        return buildItemsRelationshipsGraph(items, relationships);
    }

    /**
     * Generate a graph for a specific collection
     */
    public CytoscapeDto getCollectionGraph(Long collectionId) {
        log.debug("Generating graph for collection {}", collectionId);

        // Get collection members
        List<Relationship> collectionMembers = relationshipRepository.findCollectionMembers(collectionId);
        List<Long> itemIds = collectionMembers.stream()
                .map(Relationship::getSourceItemId)
                .collect(Collectors.toList());

        // Get the items in this collection
        List<Item> items = itemRepository.findAllById(itemIds);

        // Get relationships between these items
        List<Relationship> relationships = relationshipRepository.findAll().stream()
                .filter(rel -> itemIds.contains(rel.getSourceItemId()) &&
                        itemIds.contains(rel.getTargetItemId()) &&
                        !rel.getRelationshipType().equals("collection")) // Exclude collection relationships
                .collect(Collectors.toList());

        log.debug("Found {} items and {} relationships in collection", items.size(), relationships.size());

        return buildItemsRelationshipsGraph(items, relationships);
    }

    /**
     * Generate graph filtered by item types
     */
    public CytoscapeDto getGraphByItemTypes(List<String> itemTypes, boolean includeRelationships) {
        log.debug("Generating graph for item types: {} (relationships: {})", itemTypes, includeRelationships);

        // Get items of specified types
        List<Item> items = itemRepository.findByItemTypeIn(itemTypes);
        List<Long> itemIds = items.stream().map(Item::getId).toList();

        if (includeRelationships) {
            // Get relationships between these items
            List<Relationship> relationships = relationshipRepository.findAll().stream()
                    .filter(rel -> itemIds.contains(rel.getSourceItemId()) &&
                            itemIds.contains(rel.getTargetItemId()))
                    .collect(Collectors.toList());

            return buildItemsRelationshipsGraph(items, relationships);
        } else {
            // Get summaries for these items
            List<DetailedSummaryRecord> summaries = summaryService.findAllDetailedSummaryRecords()
                    .stream()
                    .filter(summary -> itemIds.contains(summary.itemId()))
                    .collect(Collectors.toList());

            return buildItemsSummariesGraph(items, summaries);
        }
    }

    /**
     * Generate graph for items with summaries from a specific model
     */
    public CytoscapeDto getGraphByModel(Long modelId) {
        log.debug("Generating graph for model {}", modelId);

        // Get summaries from this model
        List<DetailedSummaryRecord> summaries = summaryService.findAllDetailedSummaryRecords()
                .stream()
                .filter(summary -> summary.modelId().equals(modelId))
                .collect(Collectors.toList());

        // Get the items that have these summaries
        List<Long> itemIds = summaries.stream()
                .map(DetailedSummaryRecord::itemId)
                .distinct()
                .collect(Collectors.toList());

        List<Item> items = itemRepository.findAllById(itemIds);

        return buildItemsSummariesGraph(items, summaries);
    }

    /**
     * Generate comprehensive graph with items, summaries, and relationships
     */
    public CytoscapeDto getComprehensiveGraph(int maxItems, List<String> itemTypes) {
        log.debug("Generating comprehensive graph (maxItems: {}, types: {})", maxItems, itemTypes);

        // Get items with limit
        List<Item> items;
        if (itemTypes != null && !itemTypes.isEmpty()) {
            items = itemRepository.findByItemTypeIn(itemTypes);
        } else {
            items = itemRepository.findAll(PageRequest.of(0, maxItems)).getContent();
        }

        // Limit items if needed
        if (items.size() > maxItems) {
            items = items.subList(0, maxItems);
        }

        List<Long> itemIds = items.stream().map(Item::getId).toList();

        // Get summaries
        List<DetailedSummaryRecord> summaries = summaryService.findAllDetailedSummaryRecords()
                .stream()
                .filter(summary -> itemIds.contains(summary.itemId()))
                .collect(Collectors.toList());

        // Get relationships
        List<Relationship> relationships = relationshipRepository.findAll().stream()
                .filter(rel -> itemIds.contains(rel.getSourceItemId()) &&
                        itemIds.contains(rel.getTargetItemId()))
                .collect(Collectors.toList());

        return buildComprehensiveGraph(items, summaries, relationships);
    }

    /**
     * Get available item types
     */
    public List<String> getAvailableItemTypes() {
        return itemRepository.findAllItemTypes();
    }

    /**
     * Get graph statistics
     */
    public GraphStats getGraphStats() {
        log.debug("Generating graph statistics");

        int totalItems = (int) itemRepository.count();
        int totalSummaries = summaryService.findAllDetailedSummaryRecords().size();
        int totalRelationships = (int) relationshipRepository.count();

        // Count collections (relationships with type 'collection_definition')
        int totalCollections = relationshipRepository.findByRelationshipType("collection_definition").size();

        // Get item type counts
        Map<String, Long> typeCounts = itemRepository.findAll().stream()
                .collect(Collectors.groupingBy(Item::getItemType, Collectors.counting()));

        List<ItemTypeCount> itemTypeCounts = typeCounts.entrySet().stream()
                .map(entry -> new ItemTypeCount(entry.getKey(), entry.getValue().intValue()))
                .collect(Collectors.toList());

        return new GraphStats(totalItems, totalSummaries, totalRelationships, totalCollections, itemTypeCounts);
    }

    // === PRIVATE HELPER METHODS ===

    /**
     * Build graph with items and summaries
     */
    private CytoscapeDto buildItemsSummariesGraph(List<Item> items, List<DetailedSummaryRecord> summaries) {
        List<CytoscapeDto.CytoscapeNode> nodes = new ArrayList<>();
        List<CytoscapeDto.CytoscapeEdge> edges = new ArrayList<>();

        // Add item nodes
        for (Item item : items) {
            nodes.add(CytoscapeDto.CytoscapeNode.builder()
                    .data(CytoscapeDto.NodeData.builder()
                            .id("item-" + item.getId())
                            .label(item.getName())
                            .type(item.getItemType())
                            .details(item)
                            .build())
                    .classes(item.getItemType())
                    .build());
        }

        // Add summary nodes and connect to items
        for (DetailedSummaryRecord summary : summaries) {
            String summaryId = "summary-" + summary.id();
            String itemId = "item-" + summary.itemId();

            // Add summary node
            nodes.add(CytoscapeDto.CytoscapeNode.builder()
                    .data(CytoscapeDto.NodeData.builder()
                            .id(summaryId)
                            .label(summary.modelName() + " Summary")
                            .type("summary")
                            .details(summary)
                            .build())
                    .classes("summary")
                    .build());

            // Connect summary to item
            edges.add(CytoscapeDto.CytoscapeEdge.builder()
                    .data(CytoscapeDto.EdgeData.builder()
                            .id("edge-" + itemId + "-" + summaryId)
                            .source(itemId)
                            .target(summaryId)
                            .label("summarizes")
                            .build())
                    .build());
        }

        // Group summaries by model type
        summaries.stream()
                .collect(Collectors.groupingBy(DetailedSummaryRecord::modelName))
                .forEach((modelName, modelSummaries) -> {
                    if (modelSummaries.size() > 1) {
                        // Create a model node
                        String modelId = "model-" + modelName.replaceAll("\\s+", "-").toLowerCase();

                        nodes.add(CytoscapeDto.CytoscapeNode.builder()
                                .data(CytoscapeDto.NodeData.builder()
                                        .id(modelId)
                                        .label(modelName)
                                        .type("model")
                                        .build())
                                .classes("model")
                                .build());

                        // Connect summaries to model
                        for (DetailedSummaryRecord summary : modelSummaries) {
                            String summaryId = "summary-" + summary.id();

                            edges.add(CytoscapeDto.CytoscapeEdge.builder()
                                    .data(CytoscapeDto.EdgeData.builder()
                                            .id("edge-" + modelId + "-" + summaryId)
                                            .source(summaryId)
                                            .target(modelId)
                                            .label("generated-by")
                                            .build())
                                    .build());
                        }
                    }
                });

        CytoscapeDto.Elements elements = new CytoscapeDto.Elements(nodes, edges);
        return CytoscapeDto.builder().elements(elements).build();
    }

    /**
     * Build graph with items and relationships
     */
    private CytoscapeDto buildItemsRelationshipsGraph(List<Item> items, List<Relationship> relationships) {
        List<CytoscapeDto.CytoscapeNode> nodes = new ArrayList<>();
        List<CytoscapeDto.CytoscapeEdge> edges = new ArrayList<>();

        // Add item nodes
        for (Item item : items) {
            nodes.add(CytoscapeDto.CytoscapeNode.builder()
                    .data(CytoscapeDto.NodeData.builder()
                            .id("item-" + item.getId())
                            .label(item.getName())
                            .type(item.getItemType())
                            .details(item)
                            .build())
                    .classes(item.getItemType())
                    .build());
        }

        // Add relationship edges
        for (Relationship relationship : relationships) {
            String sourceId = "item-" + relationship.getSourceItemId();
            String targetId = "item-" + relationship.getTargetItemId();
            String edgeId = "rel-" + relationship.getId();

            edges.add(CytoscapeDto.CytoscapeEdge.builder()
                    .data(CytoscapeDto.EdgeData.builder()
                            .id(edgeId)
                            .source(sourceId)
                            .target(targetId)
                            .label(relationship.getRelationshipType())
                            .build())
                    .build());
        }

        CytoscapeDto.Elements elements = new CytoscapeDto.Elements(nodes, edges);
        return CytoscapeDto.builder().elements(elements).build();
    }

    /**
     * Build comprehensive graph with items, summaries, and relationships
     */
    private CytoscapeDto buildComprehensiveGraph(List<Item> items, List<DetailedSummaryRecord> summaries, List<Relationship> relationships) {
        List<CytoscapeDto.CytoscapeNode> nodes = new ArrayList<>();
        List<CytoscapeDto.CytoscapeEdge> edges = new ArrayList<>();

        // Add item nodes
        for (Item item : items) {
            nodes.add(CytoscapeDto.CytoscapeNode.builder()
                    .data(CytoscapeDto.NodeData.builder()
                            .id("item-" + item.getId())
                            .label(item.getName())
                            .type(item.getItemType())
                            .details(item)
                            .build())
                    .classes(item.getItemType())
                    .build());
        }

        // Add summary nodes and edges
        for (DetailedSummaryRecord summary : summaries) {
            String summaryId = "summary-" + summary.id();
            String itemId = "item-" + summary.itemId();

            nodes.add(CytoscapeDto.CytoscapeNode.builder()
                    .data(CytoscapeDto.NodeData.builder()
                            .id(summaryId)
                            .label(summary.modelName() + " Summary")
                            .type("summary")
                            .details(summary)
                            .build())
                    .classes("summary")
                    .build());

            edges.add(CytoscapeDto.CytoscapeEdge.builder()
                    .data(CytoscapeDto.EdgeData.builder()
                            .id("edge-" + itemId + "-" + summaryId)
                            .source(itemId)
                            .target(summaryId)
                            .label("summarizes")
                            .build())
                    .build());
        }

        // Add relationship edges
        for (Relationship relationship : relationships) {
            String sourceId = "item-" + relationship.getSourceItemId();
            String targetId = "item-" + relationship.getTargetItemId();
            String edgeId = "rel-" + relationship.getId();

            edges.add(CytoscapeDto.CytoscapeEdge.builder()
                    .data(CytoscapeDto.EdgeData.builder()
                            .id(edgeId)
                            .source(sourceId)
                            .target(targetId)
                            .label(relationship.getRelationshipType())
                            .build())
                    .build());
        }

        CytoscapeDto.Elements elements = new CytoscapeDto.Elements(nodes, edges);
        return CytoscapeDto.builder().elements(elements).build();
    }
}
