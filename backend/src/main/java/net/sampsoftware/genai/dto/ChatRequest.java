package net.sampsoftware.genai.dto;

public class ChatRequest {
    private String content;

    public ChatRequest() {}

    public ChatRequest(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
