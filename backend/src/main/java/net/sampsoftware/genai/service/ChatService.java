package net.sampsoftware.genai.service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



@Service
public class ChatService {
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final ChatModel chatModel;

    public ChatService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String chat(String message) {
        logger.info("My message: {}", message);
        String retVal = chatModel.call(message);
        logger.info("The reply: {}", retVal);
        return retVal;
    }
}
