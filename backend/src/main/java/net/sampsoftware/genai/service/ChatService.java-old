package net.sampsoftware.genai.service;

import org.springframework.stereotype.Service;
import org.springframework.ai.chat.client.ChatClient;


@Service
public class ChatService {

    private final ChatClient chatClient;

    public ChatService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String chat(String content) {
        return this.chatClient.prompt()
            .user(content)
            .call()
            .content();
    }
}
