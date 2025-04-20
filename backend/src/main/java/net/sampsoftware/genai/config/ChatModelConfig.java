package net.sampsoftware.genai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;


@Configuration
public class ChatModelConfig {

    @Bean
    public ChatModel chatModel(OpenAiChatModel openAiChatModel) {
        return openAiChatModel; // If you're using OpenAI
    }
}
