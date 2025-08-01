package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.exception.ValidationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final AIService aiService;

    public String chat(String content) {
        log.info("Processing chat request with content length: {}", content.length());
        
        if (content == null || content.trim().isEmpty()) {
            log.warn("Received empty chat content");
            throw new ValidationException("Chat content cannot be empty");
        }
        
        if (content.length() > 10000) {
            log.warn("Chat content exceeds maximum length: {} characters", content.length());
            throw new ValidationException("Chat content too long (max 10000 characters)");
        }
        
        try {
            log.debug("Generating AI response for chat content: {}", 
                    content.length() > 100 ? content.substring(0, 100) + "..." : content);
            
            String response = aiService.generateResponse(content, null);
            
            log.info("Successfully generated chat response with length: {}", response.length());
            return response;
            
        } catch (Exception e) {
            log.error("Failed to generate chat response: {}", e.getMessage(), e);
            throw e;
        }
    }
}