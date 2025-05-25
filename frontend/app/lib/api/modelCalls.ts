// frontend/app/lib/api/modelCalls.ts
import axios from 'axios';
import { API_URL } from '@/app/config';

export interface ModelCallRecord {
    id: number;
    modelConfigurationId?: number;
    modelConfigurationJson?: any;
    provider?: string;
    promptText?: string;
    promptJson?: any;
    responseText?: string;
    responseJson?: any;
    tokenUsage?: any;
    chatOptions?: any;
    metadata?: any;
    success?: boolean;
    errorMessage?: string;
    errorClass?: string;
    errorStacktrace?: string;
    startTime?: string;
    endTime?: string;
    durationMs?: number;
    apiDurationMs?: number;
    processingDurationMs?: number;
    batchId?: number;
    createdAt: string;
    modelName?: string;
    modelProvider?: string;
    correlationId?: string;
    userId?: string;
    requestContext?: string;
}

export interface ModelCallStats {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    successRate: number;
    averageResponseTime?: number;
    callsLast24Hours: number;
    callsLast7Days: number;
}

export interface ProviderPerformance {
    provider: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    successRate: number;
    averageResponseTime?: number;
    averageApiTime?: number;
    averageProcessingTime?: number;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export const getAllModelCalls = async (
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
): Promise<PagedResponse<ModelCallRecord>> => {
    const response = await axios.get<PagedResponse<ModelCallRecord>>(
        `${API_URL}/api/model-calls?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
    return response.data;
};

export const getModelCall = async (id: number): Promise<ModelCallRecord> => {
    const response = await axios.get<ModelCallRecord>(`${API_URL}/api/model-calls/${id}`);
    return response.data;
};

export const getCallsForConfiguration = async (configId: number): Promise<ModelCallRecord[]> => {
    const response = await axios.get<ModelCallRecord[]>(`${API_URL}/api/model-calls/config/${configId}`);
    return response.data;
};

export const getCallsForBatch = async (batchId: number): Promise<ModelCallRecord[]> => {
    const response = await axios.get<ModelCallRecord[]>(`${API_URL}/api/model-calls/batch/${batchId}`);
    return response.data;
};

export const getCallsForProvider = async (provider: string): Promise<ModelCallRecord[]> => {
    const response = await axios.get<ModelCallRecord[]>(`${API_URL}/api/model-calls/provider/${encodeURIComponent(provider)}`);
    return response.data;
};

export const getFailedCalls = async (): Promise<ModelCallRecord[]> => {
    const response = await axios.get<ModelCallRecord[]>(`${API_URL}/api/model-calls/failed`);
    return response.data;
};

export const getRecentCalls = async (hours: number = 24): Promise<ModelCallRecord[]> => {
    const response = await axios.get<ModelCallRecord[]>(`${API_URL}/api/model-calls/recent?hours=${hours}`);
    return response.data;
};

export const getModelCallStats = async (): Promise<ModelCallStats> => {
    const response = await axios.get<ModelCallStats>(`${API_URL}/api/model-calls/stats`);
    return response.data;
};

export const getPerformanceMetrics = async (): Promise<ProviderPerformance[]> => {
    const response = await axios.get<ProviderPerformance[]>(`${API_URL}/api/model-calls/performance`);
    return response.data;
};
