// frontend/app/types/operations.ts

export interface Operation {
    id: string;
    name: string;
    description: string;
    requiresCollection: boolean;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface OperationRequest {
    operationId: string;
    modelConfigurationId: number;
    collectionId?: number;
    parameters?: Record<string, any>;
}

export interface OperationResponse {
    operationId: string;
    status: 'success' | 'error' | 'partial';
    message: string;
    results?: {
        // Common properties that all operations might have
        successCount?: number;
        failureCount?: number;
        createdEntities?: number[];
        details?: any;

        // Specific to SummarizeEach
        summaryIds?: number[];

        // Specific to SummarizeGroup
        summaryId?: number;
        collectionId?: number;
        entityCount?: number;

        // Specific to GenerateRelationships
        relationshipCount?: number;
        relationshipIds?: number[];
        entityPairsProcessed?: number;
    };
}

// Specific operation result types - these should match what the backend actually returns
export interface SummarizeEachResult {
    successCount: number;
    failureCount: number;
    summaryIds: number[];
}

export interface SummarizeGroupResult {
    summaryId: number;
    collectionId: number;
    entityCount: number;
}

export interface GenerateRelationshipsResult {
    relationshipCount: number;
    relationshipIds: number[];
    summaryIds: number[];
    entityPairsProcessed: number;
}
