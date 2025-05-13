package net.sampsoftware.genai.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.model.ModelConfiguration;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AIService extends BaseAiApiService {

    private final ChatClient.Builder chatClientBuilder;

    public String generateResponse(String promptText, ModelConfiguration modelConfig) {
        ChatClient chatClient = buildChatClient(modelConfig);
        
        return executeApiCall(
            () ->
            chatClient.prompt()
                .user(promptText)
                .call()
                .content()
        );
    }

    public String generateResponse(String systemPrompt, String userPrompt, 
                                 ModelConfiguration modelConfig) {
        ChatClient chatClient = buildChatClient(modelConfig);
        
        return executeApiCall(
            () ->
            chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content()
        );
    }

    private ChatClient buildChatClient(ModelConfiguration modelConfig) {
        if (modelConfig == null || modelConfig.getModelConfig() == null) {
            return chatClientBuilder.build();
        }
        
        JsonNode configNode = modelConfig.getModelConfig();
        
        // Configure options based on the model configuration
        ChatOptions.Builder optionsBuilder = ChatOptions.builder();
        
        if (configNode.has("temperature")) {
            optionsBuilder.temperature(configNode.get("temperature").doubleValue());
        }
        
        if (configNode.has("top_p")) {
            optionsBuilder.topP(configNode.get("top_p").doubleValue());
        }
        
        if (configNode.has("max_tokens")) {
            optionsBuilder.maxTokens(configNode.get("max_tokens").intValue());
        }
        
        return chatClientBuilder
                .defaultOptions(optionsBuilder.build())
                .build();
    }
}