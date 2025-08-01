// backend/src/main/java/net/sampsoftware/genai/service/AIService.java
package net.sampsoftware.genai.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.ModelConfiguration;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService extends BaseAiApiService {

    private final OpenAiChatModel chatModel;

    public String generateResponse(String promptText, ModelConfiguration modelConfig) {
        OpenAiChatOptions options = buildChatOptions(modelConfig);

        return executeApiCall(() -> {
            UserMessage userMessage = new UserMessage(promptText);
            Prompt prompt = new Prompt(userMessage, options);
            return chatModel.call(prompt).getResult().getOutput().getText();
        });
    }

    public ChatResponse generateFullResponse(String promptText, ModelConfiguration modelConfig) {
        OpenAiChatOptions options = buildChatOptions(modelConfig);

        try {
            UserMessage userMessage = new UserMessage(promptText);
            Prompt prompt = new Prompt(userMessage, options);
            return chatModel.call(prompt);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String generateResponse(String systemPrompt, String userPrompt,
                                   ModelConfiguration modelConfig) {
        OpenAiChatOptions options = buildChatOptions(modelConfig);

        return executeApiCall(() -> {
            SystemMessage systemMessage = new SystemMessage(systemPrompt);
            UserMessage userMessage = new UserMessage(userPrompt);
            Prompt prompt = new Prompt(java.util.List.of(systemMessage, userMessage), options);
            return chatModel.call(prompt).getResult().getOutput().getText();
        });
    }

    private OpenAiChatOptions buildChatOptions(ModelConfiguration modelConfig) {
        if (modelConfig == null || modelConfig.getModelConfig() == null) {
            return OpenAiChatOptions.builder().build();
        }

        JsonNode configNode = modelConfig.getModelConfig();

        OpenAiChatOptions.Builder optionsBuilder = OpenAiChatOptions.builder();
        
        // Set the model name from the configuration
        if (modelConfig.getModel() != null && modelConfig.getModel().getModelName() != null) {
            String modelName = modelConfig.getModel().getModelName();
            // Convert display name to API model name
            String apiModelName = convertToApiModelName(modelName);
            log.debug("Using model: {} (converted from: {})", apiModelName, modelName);
            optionsBuilder.model(apiModelName);
        }

        if (configNode.has("temperature")) {
            optionsBuilder.temperature(configNode.get("temperature").doubleValue());
        }

        if (configNode.has("top_p")) {
            optionsBuilder.topP(configNode.get("top_p").doubleValue());
        }

        if (configNode.has("max_tokens")) {
            optionsBuilder.maxTokens(configNode.get("max_tokens").intValue());
        }

        if (configNode.has("frequency_penalty")) {
            optionsBuilder.frequencyPenalty(configNode.get("frequency_penalty").doubleValue());
        }

        if (configNode.has("presence_penalty")) {
            optionsBuilder.presencePenalty(configNode.get("presence_penalty").doubleValue());
        }

        return optionsBuilder.build();
    }
    
    /**
     * Convert display model names to OpenAI API model names
     */
    private String convertToApiModelName(String displayName) {
        if (displayName == null) {
            return "gpt-3.5-turbo"; // fallback
        }
        
        switch (displayName.toUpperCase()) {
            case "GPT-3.5-TURBO":
                return "gpt-3.5-turbo";
            case "GPT-4":
                return "gpt-4";
            case "GPT-4O":
                return "gpt-4o";
            case "GPT-4O-MINI":
                return "gpt-4o-mini";
            case "GPT-4-TURBO":
                return "gpt-4-turbo";
            default:
                // If it's already in API format, return as-is
                if (displayName.matches("^gpt-[0-9].*")) {
                    return displayName.toLowerCase();
                }
                // Otherwise, try to convert common patterns
                return displayName.toLowerCase()
                    .replace(" ", "-")
                    .replace("_", "-");
        }
    }
}
