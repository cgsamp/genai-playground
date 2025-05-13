package net.sampsoftware.genai.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.EntitySummaryDto;
import net.sampsoftware.genai.model.EntitySummary;
import net.sampsoftware.genai.repository.EntitySummaryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntitySummaryService {

    private final EntitySummaryRepository entitySummaryRepository;
    
    @Transactional
    public EntitySummary save(EntitySummary entitySummary) {
        return entitySummaryRepository.save(entitySummary);        
    }

    public List<EntitySummaryDto> findAll(String entityType) {
        return entitySummaryRepository.findDtosByType(entityType);
    }

    public List<EntitySummaryDto> findByTypeAndIds(String entityType, List<Long> entityIds) {
        return entitySummaryRepository.findDtosByTypeAndEntityIds(entityType, entityIds);
    }

    public List<String> findAllTypes() {
        return entitySummaryRepository.findAllDistinctTypes();
    }
}