package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ModelConfigurationRepository modelConfigurationRepo;


    public ModelConfiguration findByIdWithModel(Long modelConfigurationId) {
        Optional<ModelConfiguration> modelConfigOpt = modelConfigurationRepo.findByIdWithModel(modelConfigurationId);
        if (modelConfigOpt.isEmpty()) {
            throw new RuntimeException("Model configuration not found");
        }
        ModelConfiguration modelConfig = modelConfigOpt.get();
        return modelConfig;
    }

}