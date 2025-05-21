package net.sampsoftware.genai.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.SummaryRecords.DetailedSummaryRecord;
import net.sampsoftware.genai.dto.SummaryRecords.SummaryRecord;
import net.sampsoftware.genai.exception.ResourceNotFoundException;
import net.sampsoftware.genai.model.Summary;
import net.sampsoftware.genai.repository.RankedBookRepository;
import net.sampsoftware.genai.repository.SummaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SummaryService {

    private final SummaryRepository summaryRepository;
    private final RankedBookRepository bookRepository;

    @Transactional
    public Summary save(Summary summary) {
        return summaryRepository.save(summary);
    }

    @Transactional(readOnly = true)
    public List<DetailedSummaryRecord> findByEntityTypeAndIds(String entityType, List<Long> entityIds) {
        return summaryRepository.findByEntityTypeAndEntityIdIn(entityType, entityIds).stream()
                .map(this::toDetailedDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DetailedSummaryRecord> findByEntityType(String entityType) {
        return summaryRepository.findByEntityType(entityType).stream()
                .map(this::toDetailedDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> findAllEntityTypes() {
        return summaryRepository.findAllDistinctEntityTypes();
    }

    @Transactional
    public SummaryRecord create(Summary summary) {
        Summary saved = summaryRepository.save(summary);
        return toSimpleDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DetailedSummaryRecord> findAllDetailedSummaryRecords() {
        return summaryRepository.findAllWithDetails().stream()
                .map(this::toDetailedDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public SummaryRecord update(Summary summary) {
        Summary existing = summaryRepository.findById(summary.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Summary not found with id " + summary.getId()));

        // Update fields from BaseEntity
        existing.setName(summary.getName());
        if (summary.getAttributes() != null) {
            existing.setAttributes(summary.getAttributes());
        }

        // Update Summary-specific fields
        existing.setEntityId(summary.getEntityId());
        existing.setEntityType(summary.getEntityType());
        existing.setContent(summary.getContent());
        existing.setModelConfiguration(summary.getModelConfiguration());

        return toSimpleDto(summaryRepository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        if (!summaryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Summary not found with id " + id);
        }
        summaryRepository.deleteById(id);
    }

    // Helper methods to convert entities to DTOs
    private SummaryRecord toSimpleDto(Summary summary) {
        return new SummaryRecord(
                summary.getId(),
                summary.getEntityId(),
                summary.getEntityType(),
                summary.getContent(),
                summary.getCreatedAt()
        );
    }

    private DetailedSummaryRecord toDetailedDto(Summary summary) {
        return new DetailedSummaryRecord(
                summary.getId(),
                summary.getEntityId(),
                summary.getEntityType(),
                summary.getName(), // Use name from BaseEntity
                summary.getEntityDetails(), // Get from attributes
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
}
