// frontend/app/lib/api/operations.ts

import axios from 'axios';
import { API_URL } from '@/app/config';
import type {
    OperationRequest,
    OperationResponse,
    SummarizeEachResult,
    SummarizeGroupResult,
    GenerateRelationshipsResult
} from '@/app/types/operations';

export const executeOperation = async (request: OperationRequest): Promise<OperationResponse> => {
    const response = await axios.post<OperationResponse>(`${API_URL}/api/operations/execute`, request);
    return response.data;
};

// Specific operation functions for type safety
export const summarizeEach = async (
    modelConfigurationId: number,
    collectionId: number
): Promise<SummarizeEachResult> => {
    const request: OperationRequest = {
        operationId: 'summarize_each',
        modelConfigurationId,
        collectionId,
    };

    const response = await executeOperation(request);
    if (response.status === 'error') {
        throw new Error(response.message);
    }

    // Extract the specific properties we need
    return {
        successCount: response.results?.successCount || 0,
        failureCount: response.results?.failureCount || 0,
        summaryIds: response.results?.summaryIds || []
    };
};

export const summarizeGroup = async (
    modelConfigurationId: number,
    collectionId: number
): Promise<SummarizeGroupResult> => {
    const request: OperationRequest = {
        operationId: 'summarize_group',
        modelConfigurationId,
        collectionId,
    };

    const response = await executeOperation(request);
    if (response.status === 'error') {
        throw new Error(response.message);
    }

    // Extract the specific properties we need
    return {
        summaryId: response.results?.summaryId || 0,
        collectionId: response.results?.collectionId || collectionId,
        entityCount: response.results?.entityCount || 0
    };
};

export const generateRelationships = async (
    modelConfigurationId: number,
    collectionId: number,
    relationshipTypes?: string[]
): Promise<GenerateRelationshipsResult> => {
    const request: OperationRequest = {
        operationId: 'generate_relationships',
        modelConfigurationId,
        collectionId,
        parameters: {
            relationshipTypes: relationshipTypes || ['similar_themes', 'influenced_by', 'contrasts_with']
        }
    };

    const response = await executeOperation(request);
    if (response.status === 'error') {
        throw new Error(response.message);
    }

    // Extract the specific properties we need
    return {
        relationshipCount: response.results?.relationshipCount || 0,
        relationshipIds: response.results?.relationshipIds || [],
        summaryIds: response.results?.summaryIds || [],
        entityPairsProcessed: response.results?.entityPairsProcessed || 0
    };
};
