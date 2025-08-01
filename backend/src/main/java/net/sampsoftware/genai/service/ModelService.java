package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.exception.ModelApiException;
import net.sampsoftware.genai.exception.ModelNotFoundException;
import net.sampsoftware.genai.exception.ValidationException;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModelService {
    private final ModelConfigurationRepository modelConfigurationRepo;
    private final RestTemplate rest = new RestTemplate();

    @Value("${openai.api-key}")
    private String apiKey;
    private final String baseUrl = "https://api.openai.com/v1";

    public ModelConfiguration findConfigurationById(Long modelConfigurationId) {
        log.debug("Finding model configuration with ID: {}", modelConfigurationId);
        
        if (modelConfigurationId == null || modelConfigurationId <= 0) {
            throw new ValidationException("Model configuration ID must be a positive number");
        }
        
        Optional<ModelConfiguration> modelConfigOpt = modelConfigurationRepo.findByIdWithModel(modelConfigurationId);
        if (modelConfigOpt.isEmpty()) {
            log.warn("Model configuration not found for ID: {}", modelConfigurationId);
            throw new ModelNotFoundException(modelConfigurationId);
        }
        
        ModelConfiguration modelConfig = modelConfigOpt.get();
        log.debug("Successfully found model configuration: {}", modelConfig.getId());
        return modelConfig;
    }


    public List<String> getUsableOpenAiModels() {
        log.info("Starting OpenAI models discovery process");
        List<String> usable = new ArrayList<>();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            log.debug("Fetching available models from OpenAI API");
            ResponseEntity<Map> response = rest.exchange(
                    baseUrl + "/models", HttpMethod.GET, entity, Map.class);
            
            if (response.getBody() == null) {
                log.error("Received null response body from OpenAI models API");
                throw new ModelApiException("Empty response from OpenAI models API");
            }
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
            
            if (data == null) {
                log.error("No models data found in OpenAI API response");
                throw new ModelApiException("No models data in OpenAI API response");
            }
            
            List<String> openAiModelIds = data.stream()
                    .map(model -> (String) model.get("id"))
                    .filter(id -> id != null)
                    .toList();
            
            log.info("Found {} available OpenAI models, testing usability", openAiModelIds.size());

            for (String model : openAiModelIds) {
                log.debug("Testing model availability: {}", model);
                if (tryOpenAiModel(model)) {
                    usable.add(model);
                    log.debug("Model {} is usable", model);
                } else {
                    log.debug("Model {} is not usable", model);
                }
            }
            
            log.info("Model discovery completed. Found {} usable models out of {} total", 
                    usable.size(), openAiModelIds.size());
            
        } catch (RestClientException e) {
            log.error("Failed to fetch models from OpenAI API", e);
            throw new ModelApiException("Failed to communicate with OpenAI API", e);
        }

        return usable;
    }

    private boolean tryOpenAiModel(String modelId) {
        if (modelId == null || modelId.trim().isEmpty()) {
            log.warn("Skipping null or empty model ID");
            return false;
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "model", modelId,
                    "messages", List.of(Map.of("role", "user", "content", "Hello")),
                    "max_tokens", 1
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            rest.postForEntity(baseUrl + "/chat/completions", entity, Map.class);
            return true;
        } catch (RestClientException e) {
            log.debug("Model {} test failed: {}", modelId, e.getMessage());
            return false;
        } catch (Exception e) {
            log.warn("Unexpected error testing model {}: {}", modelId, e.getMessage());
            return false;
        }
    }
}
