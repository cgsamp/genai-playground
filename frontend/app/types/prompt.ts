// app/types/prompt.ts

export interface PromptType {
    id: number;
    promptType: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Prompt {
    id: number;
    name: string;
    text: string;
    type: PromptType;
    createdAt: string;
    updatedAt: string;
    deletedDate?: string;
    deleted: boolean;
}

export interface PromptCreateRequest {
    name: string;
    text: string;
    typeId: number;
}

export interface PromptUpdateRequest {
    name: string;
    text: string;
    typeId: number;
}