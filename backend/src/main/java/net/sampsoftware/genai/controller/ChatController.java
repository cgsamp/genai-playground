package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.dto.ChatRequest;
import net.sampsoftware.genai.dto.ChatResponse;
import net.sampsoftware.genai.service.ChatService;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public Mono<ChatResponse> chat(@RequestBody ChatRequest request) {
        return Mono.fromCallable(() -> {
            String reply = chatService.chat(request.getContent());
            return new ChatResponse(reply);
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
