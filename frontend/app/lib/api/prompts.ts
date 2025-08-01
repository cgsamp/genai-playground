// app/lib/api/prompts.ts
import axios from 'axios';
import { Prompt, PromptType, PromptCreateRequest, PromptUpdateRequest } from '@/app/types';
import { API_URL } from '@/app/config';

// Prompt Types API
export const getPromptTypes = async (): Promise<PromptType[]> => {
    const response = await axios.get<PromptType[]>(`${API_URL}/api/prompt-types`);
    return response.data;
};

// Prompts API
export const getPrompts = async (): Promise<Prompt[]> => {
    const response = await axios.get<Prompt[]>(`${API_URL}/api/prompts`);
    return response.data;
};

export const getPrompt = async (id: number): Promise<Prompt> => {
    const response = await axios.get<Prompt>(`${API_URL}/api/prompts/${id}`);
    return response.data;
};

export const createPrompt = async (prompt: PromptCreateRequest): Promise<Prompt> => {
    const response = await axios.post<Prompt>(`${API_URL}/api/prompts`, prompt);
    return response.data;
};

export const updatePrompt = async (id: number, prompt: PromptUpdateRequest): Promise<Prompt> => {
    const response = await axios.put<Prompt>(`${API_URL}/api/prompts/${id}`, prompt);
    return response.data;
};

export const deletePrompt = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/prompts/${id}`);
};

export const searchPrompts = async (name: string): Promise<Prompt[]> => {
    const response = await axios.get<Prompt[]>(`${API_URL}/api/prompts/search`, {
        params: { name }
    });
    return response.data;
};

export const getPromptsByType = async (typeId: number): Promise<Prompt[]> => {
    const response = await axios.get<Prompt[]>(`${API_URL}/api/prompts/type/${typeId}`);
    return response.data;
};