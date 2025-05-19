export type ChatRole = 'user' | 'bot' | 'error' | 'system';

export interface ChatMessage {
    role: ChatRole;
    content: string;
    timestamp?: string;
}

export interface ChatRequest {
    content: string;
}

export interface ChatResponse {
    reply: string;
}
