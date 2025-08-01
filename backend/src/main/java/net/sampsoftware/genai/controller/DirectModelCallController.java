package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.DirectModelCallRequest;
import net.sampsoftware.genai.dto.DirectModelCallResponse;
import net.sampsoftware.genai.exception.ResourceNotFoundException;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import net.sampsoftware.genai.service.AIService;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/model-call")
@RequiredArgsConstructor
@Slf4j
public class DirectModelCallController {

    private final AIService aiService;
    private final ModelConfigurationRepository modelConfigurationRepository;

    @PostMapping("/direct")
    public ResponseEntity<DirectModelCallResponse> callModel(@Valid @RequestBody DirectModelCallRequest request) {
        log.info("Direct model call request - Config ID: {}, Prompt length: {}", 
                request.getModelConfigurationId(), 
                request.getPrompt() != null ? request.getPrompt().length() : 0);

        try {
            // Verify the model configuration exists
            ModelConfiguration config = modelConfigurationRepository.findById(request.getModelConfigurationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Model configuration not found with id: " + request.getModelConfigurationId()));

            log.debug("Using model configuration: {} ({})", 
                    config.getModel() != null ? config.getModel().getModelName() : "Unknown",
                    config.getModel() != null ? config.getModel().getModelProvider() : "Unknown");

            // Call the AI service directly
            String response = aiService.generateResponse(request.getPrompt(), config);

            // Try to get the most recent model call ID (this is best effort)
            Long modelCallId = null;
            // Note: We could enhance this to return the actual model call ID from AIService if needed

            return ResponseEntity.ok(DirectModelCallResponse.builder()
                    .response(response)
                    .modelCallId(modelCallId)
                    .success(true)
                    .build());

        } catch (Exception e) {
            log.error("Error calling model directly: {}", e.getMessage(), e);
            
            return ResponseEntity.ok(DirectModelCallResponse.builder()
                    .response(null)
                    .modelCallId(null)
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build());
        }
    }
}