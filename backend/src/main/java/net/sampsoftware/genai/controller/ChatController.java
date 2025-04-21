package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.dto.ChatRequest;
import net.sampsoftware.genai.dto.ChatResponse;
import net.sampsoftware.genai.service.ChatService;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public Mono<ChatResponse> chat(@RequestBody ChatRequest request) {
        logger.info("Chat Request: {}", request);
        return Mono.fromCallable(() -> new ChatResponse(chatService.chat(request.getContent())))
                .subscribeOn(Schedulers.boundedElastic());    }
}
