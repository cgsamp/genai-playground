package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.ChatRequest;
import net.sampsoftware.genai.dto.ChatResponse;
import net.sampsoftware.genai.exception.ValidationException;
import net.sampsoftware.genai.service.ChatService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        log.info("Received chat request with content length: {}", 
                request.getContent() != null ? request.getContent().length() : 0);
        
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ValidationException("Chat content cannot be empty");
        }
        
        try {
            String reply = chatService.chat(request.getContent());
            log.debug("Generated chat response with length: {}", reply.length());
            return new ChatResponse(reply);
        } catch (Exception e) {
            log.error("Error processing chat request: {}", e.getMessage(), e);
            throw e;
        }
    }
}

