// app/types/api.ts
import { Book, BookSummaryRequest, BookSummaryResponse } from './book';
import { ChatRequest, ChatResponse } from './chat';
import { Model, ModelConfiguration, ModelCallRequest, ModelCallResponse, EntitySummary } from './model';

// API Request/Response type definitions can go here if needed
export interface ApiOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
}
