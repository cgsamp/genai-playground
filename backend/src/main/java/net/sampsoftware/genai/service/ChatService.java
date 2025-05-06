package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.service.AIService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final AIService aiService;

    public String chat(String content) {
        // This is a simplified version that doesn't use model configurations
        // You could enhance this to use a default model configuration
        return aiService.generateResponse(content, null);
    }
}