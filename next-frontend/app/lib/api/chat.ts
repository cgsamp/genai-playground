import axios from 'axios';
import { ChatRequest, ChatResponse } from '@/app/types';
import { API_URL } from '@/app/config';

export const sendChatMessage = async (content: string): Promise<ChatResponse> => {
    const request: ChatRequest = { content };
    const response = await axios.post<ChatResponse>(`${API_URL}/chat`, request);
    return response.data;
};
