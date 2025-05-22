// backend/src/main/java/net/sampsoftware/genai/service/AIService.java
package net.sampsoftware.genai.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.model.ModelConfiguration;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
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
}
