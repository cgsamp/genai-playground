package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
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
        Optional<ModelConfiguration> modelConfigOpt = modelConfigurationRepo.findByIdWithModel(modelConfigurationId);
        if (modelConfigOpt.isEmpty()) {
            throw new RuntimeException("Model configuration not found");
        }
        ModelConfiguration modelConfig = modelConfigOpt.get();
        return modelConfig;
    }


    public List<String> getUsableOpenAiModels() {
        List<String> usable = new ArrayList<>();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        log.debug("Fetching usable model configurations");
        ResponseEntity<Map> response = rest.exchange(
                baseUrl + "/models", HttpMethod.GET, entity, Map.class);
        log.debug("DONE Fetching usable model configurations");
        List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
        List<String> openAiModelIds = new ArrayList<>();
        for (Map<String, Object> model : data) {
            openAiModelIds.add((String) model.get("id"));
        }

        for (String model : openAiModelIds) {
            log.debug("Trying to open an openAi model {}", model);
            if (tryOpenAiModel(model)) {
                usable.add(model);
                log.debug("YES openAi model {}", model);
            } else log.debug("NO openAi model {}", model);

        }

        return usable;
    }

    private boolean tryOpenAiModel(String modelId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "model", modelId,
                "messages", List.of(Map.of("role", "user", "content", "Hello")),
                "max_tokens", 1
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            rest.postForEntity(baseUrl + "/chat/completions", entity, Map.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
