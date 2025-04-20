package net.sampsoftware.genai.controller;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatModel chatModel;

    public ChatController(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @PostMapping
    public Mono<String> chat(@RequestBody String message) {
        return Mono.fromCallable(() -> chatModel.call(message))
                   .subscribeOn(Schedulers.boundedElastic());
    }
}
