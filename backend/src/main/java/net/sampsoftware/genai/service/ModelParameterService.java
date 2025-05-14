package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.ModelParameterDto;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.model.ModelParameter;
import net.sampsoftware.genai.repository.ModelParameterRepository;
import net.sampsoftware.genai.repository.ModelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModelParameterService {

    private final ModelRepository modelRepository;
    private final ModelParameterRepository modelParameterRepository;
    
    /**
     * Add parameter guidance for a specific model
     */
    @Transactional
    public void addParameterGuidance(Long modelId, String paramName, 
                                   String description, String dataType,
                                   String minValue, String maxValue, 
                                   String defaultValue, Integer displayOrder) {
        
        Optional<Model> modelOpt = modelRepository.findById(modelId);
        if (modelOpt.isEmpty()) {
            throw new IllegalArgumentException("Model not found: " + modelId);
        }
        
        ModelParameter parameter = ModelParameter.builder()
            .model(modelOpt.get())
            .paramName(paramName)
            .description(description)
            .dataType(dataType)
            .minValue(minValue)
            .maxValue(maxValue)
            .defaultValue(defaultValue)
            .displayOrder(displayOrder)
            .build();
            
        modelParameterRepository.save(parameter);
    }
    
    /**
     * Get all parameters for a model as DTOs
     */
    @Transactional(readOnly = true)
    public List<ModelParameterDto> getParametersForModel(Long modelId) {
        return modelParameterRepository.findByModelIdOrderByDisplayOrder(modelId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert a ModelParameter entity to a DTO
     * Safely handles the lazy-loaded model property
     */
    private ModelParameterDto convertToDto(ModelParameter param) {
        return new ModelParameterDto(
            param.getId(),
            param.getModel().getId(),
            param.getParamName(),
            param.getDescription(),
            param.getDataType(),
            param.getMinValue(),
            param.getMaxValue(),
            param.getDefaultValue(),
            param.getDisplayOrder()
        );
    }
}