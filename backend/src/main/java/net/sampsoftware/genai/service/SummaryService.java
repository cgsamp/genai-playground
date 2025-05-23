package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.controller.SummaryController.BatchSummaryCount;
import net.sampsoftware.genai.controller.SummaryController.ModelSummaryCount;
import net.sampsoftware.genai.controller.SummaryController.SummaryStats;
import net.sampsoftware.genai.dto.SummaryRecords.DetailedSummaryRecord;
import net.sampsoftware.genai.dto.SummaryRecords.SummaryRecord;
import net.sampsoftware.genai.exception.ResourceNotFoundException;
import net.sampsoftware.genai.model.Item;
import net.sampsoftware.genai.model.Summary;
import net.sampsoftware.genai.repository.ItemRepository;
import net.sampsoftware.genai.repository.SummaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Complete summary service using unified Item model
 * Clean, simple, and powerful
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SummaryService {

    private final SummaryRepository summaryRepository;
    private final ItemRepository itemRepository;

    // === CORE CRUD OPERATIONS ===

    @Transactional
    public Summary save(Summary summary) {
        return summaryRepository.save(summary);
    }

    @Transactional
    public SummaryRecord create(Summary summary) {
        Summary saved = summaryRepository.save(summary);
        return toSimpleDto(saved);
    }

    @Transactional
    public SummaryRecord update(Summary summary) {
        Summary existing = summaryRepository.findById(summary.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Summary not found with id " + summary.getId()));

        // Update Summary fields - clean and simple with Item model
        existing.setItemId(summary.getItemId());
        existing.setContent(summary.getContent());
        existing.setModelConfiguration(summary.getModelConfiguration());
        existing.setBatchId(summary.getBatchId());
        if (summary.getMetadata() != null) {
            existing.setMetadata(summary.getMetadata());
        }

        return toSimpleDto(summaryRepository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        if (!summaryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Summary not found with id " + id);
        }
        summaryRepository.deleteById(id);
    }

    // === QUERY OPERATIONS ===

    @Transactional(readOnly = true)
    public List<DetailedSummaryRecord> findAllDetailedSummaryRecords() {
        return summaryRepository.findAllWithDetails().stream()
                .map(this::toDetailedDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DetailedSummaryRecord> findByItemIds(List<Long> itemIds) {
        return summaryRepository.findByItemIdIn(itemIds).stream()
                .map(this::toDetailedDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DetailedSummaryRecord> findByBatchId(Long batchId) {
        return summaryRepository.findByBatchIdOrderByCreatedAtDesc(batchId).stream()
                .map(this::toDetailedDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DetailedSummaryRecord> findByModelConfigurationId(Long modelConfigId) {
        return summaryRepository.findByModelConfigurationIdOrderByCreatedAtDesc(modelConfigId).stream()
                .map(this::toDetailedDto)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public SummaryStats getSummaryStats() {
        log.debug("Generating summary statistics");

        int totalSummaries = (int) summaryRepository.count();
        int totalItems = (int) summaryRepository.countDistinctItems();
        int totalBatches = (int) summaryRepository.countDistinctBatches();

        // Get model summary counts
        List<Object[]> modelCounts = summaryRepository.countSummariesByModel();
        List<ModelSummaryCount> modelSummaryCounts = modelCounts.stream()
                .map(row -> new ModelSummaryCount(
                        (Long) row[0],      // modelId
                        (String) row[1],    // modelName
                        ((Number) row[2]).intValue()  // count
                ))
                .collect(Collectors.toList());

        // Get recent batch counts
        List<Object[]> batchCounts = summaryRepository.getRecentBatchCounts(10);
        List<BatchSummaryCount> recentBatches = batchCounts.stream()
                .map(row -> new BatchSummaryCount(
                        (Long) row[0],      // batchId
                        ((Number) row[1]).intValue(),  // count
                        row[2].toString()   // createdAt
                ))
                .collect(Collectors.toList());

        return new SummaryStats(totalSummaries, totalItems, totalBatches, modelSummaryCounts, recentBatches);
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getSummaryCountsByItemType() {
        List<Object[]> results = summaryRepository.countSummariesByItemType();
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],                    // itemType
                        row -> ((Number) row[1]).intValue()        // count
                ));
    }


    // === DTO CONVERSION ===

    private SummaryRecord toSimpleDto(Summary summary) {
        return new SummaryRecord(
                summary.getId(),
                summary.getItemId(),
                summary.getContent(),
                summary.getCreatedAt()
        );
    }

    private DetailedSummaryRecord toDetailedDto(Summary summary) {
        // Resolve item information efficiently
        String itemName = resolveItemName(summary);
        String itemDetails = resolveItemDetails(summary);

        return new DetailedSummaryRecord(
                summary.getId(),
                summary.getItemId(),
                itemName,
                itemDetails,
                summary.getContent(),
                summary.getModelConfiguration().getModel().getModelName(),
                summary.getModelConfiguration().getModel().getModelProvider(),
                summary.getModelConfiguration().getModel().getId(),
                summary.getModelConfiguration().getId(),
                summary.getModelConfiguration().getModelConfig(),
                summary.getModelConfiguration().getComment(),
                summary.getCreatedAt()
        );
    }

    // === ITEM RESOLUTION ===

    /**
     * Resolve item name using unified Item model
     */
    private String resolveItemName(Summary summary) {
        try {
            return itemRepository.findById(summary.getItemId())
                    .map(Item::getName)
                    .orElse(String.format("Item #%d", summary.getItemId()));
        } catch (Exception e) {
            log.debug("Could not resolve item name for item {}: {}",
                    summary.getItemId(), e.getMessage());
            return String.format("Item #%d", summary.getItemId());
        }
    }

    /**
     * Resolve item details from Item's attributes
     */
    private String resolveItemDetails(Summary summary) {
        try {
            return itemRepository.findById(summary.getItemId())
                    .map(this::extractItemDetails)
                    .orElse(null);
        } catch (Exception e) {
            log.debug("Could not resolve item details for item {}: {}",
                    summary.getItemId(), e.getMessage());
            return null;
        }
    }

    /**
     * Extract meaningful details from Item's attributes JSONB field
     */
    private String extractItemDetails(Item item) {
        var attributes = item.getAttributes();
        if (attributes == null || attributes.isNull()) return null;

        // Build details based on item type and available attributes
        switch (item.getItemType().toLowerCase()) {
            case "book":
                return buildBookDetails(attributes);
            case "person":
                return buildPersonDetails(attributes);
            case "collection":
                return buildCollectionDetails(attributes);
            default:
                return buildGenericDetails(attributes);
        }
    }

    /**
     * Build details string for book items
     */
    private String buildBookDetails(com.fasterxml.jackson.databind.JsonNode attributes) {
        StringBuilder details = new StringBuilder();

        if (attributes.has("author") || attributes.has("authorName")) {
            String author = attributes.has("author") ?
                    attributes.get("author").asText() :
                    attributes.get("authorName").asText();
            details.append("Author: ").append(author);
        }

        if (attributes.has("publishYear") || attributes.has("year")) {
            if (details.length() > 0) details.append(", ");
            String year = attributes.has("publishYear") ?
                    attributes.get("publishYear").asText() :
                    attributes.get("year").asText();
            details.append("Year: ").append(year);
        }

        if (attributes.has("genre")) {
            if (details.length() > 0) details.append(", ");
            details.append("Genre: ").append(attributes.get("genre").asText());
        }

        return details.length() > 0 ? details.toString() : null;
    }

    /**
     * Build details string for person items
     */
    private String buildPersonDetails(com.fasterxml.jackson.databind.JsonNode attributes) {
        StringBuilder details = new StringBuilder();

        if (attributes.has("occupation")) {
            details.append("Occupation: ").append(attributes.get("occupation").asText());
        }

        if (attributes.has("birthDate")) {
            if (details.length() > 0) details.append(", ");
            details.append("Born: ").append(attributes.get("birthDate").asText());
        }

        if (attributes.has("nationality")) {
            if (details.length() > 0) details.append(", ");
            details.append("Nationality: ").append(attributes.get("nationality").asText());
        }

        return details.length() > 0 ? details.toString() : null;
    }

    /**
     * Build details string for collection items
     */
    private String buildCollectionDetails(com.fasterxml.jackson.databind.JsonNode attributes) {
        StringBuilder details = new StringBuilder();

        if (attributes.has("description")) {
            details.append(attributes.get("description").asText());
        }

        if (attributes.has("curator")) {
            if (details.length() > 0) details.append(" | ");
            details.append("Curator: ").append(attributes.get("curator").asText());
        }

        if (attributes.has("itemCount")) {
            if (details.length() > 0) details.append(" | ");
            details.append("Items: ").append(attributes.get("itemCount").asText());
        }

        return details.length() > 0 ? details.toString() : null;
    }

    /**
     * Build generic details for unknown item types
     */
    private String buildGenericDetails(com.fasterxml.jackson.databind.JsonNode attributes) {
        // Look for common fields that might be meaningful
        if (attributes.has("description")) {
            return attributes.get("description").asText();
        }

        if (attributes.has("summary")) {
            return attributes.get("summary").asText();
        }

        // If nothing specific, return null rather than dumping all attributes
        return null;
    }
}
