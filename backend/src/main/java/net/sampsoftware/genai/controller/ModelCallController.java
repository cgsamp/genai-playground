package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.ModelCallRequest;
import net.sampsoftware.genai.dto.ModelCallResponse;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import net.sampsoftware.genai.service.AIService;

import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/model-call")
@RequiredArgsConstructor
public class ModelCallController {

    private final AIService aiService;
    private final ModelConfigurationRepository modelConfigRepo;

    @PostMapping
    public ModelCallResponse invokeModel(@RequestBody ModelCallRequest request) {
        // Get model configuration
        Optional<ModelConfiguration> modelConfigOpt = modelConfigRepo.findByIdWithModel(request.modelConfigurationId());
        if (modelConfigOpt.isEmpty()) {
            throw new RuntimeException("Model configuration not found");
        }
        
        ModelConfiguration modelConfig = modelConfigOpt.get();
        
        // Use the service to generate a response
        String response = aiService.generateResponse(request.prompt(), modelConfig);
        
        return new ModelCallResponse(response);
    }
}