package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.dto.ChatRequest;
import net.sampsoftware.genai.dto.ChatResponse;
import net.sampsoftware.genai.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String reply = chatService.chat(request.getContent());
        return new ChatResponse(reply);
    }

}

