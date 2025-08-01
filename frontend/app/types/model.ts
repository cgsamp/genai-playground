import { ID } from './common';

export interface Model {
    id: ID;
    modelName: string;
    modelProvider: string;
    modelApiUrl: string;
    comment: string;
}

export interface ModelParameter {
    id: ID;
    modelId: ID;
    paramName: string;
    description: string;
    dataType: string;
    minValue: string;
    maxValue: string;
    defaultValue: string;
    displayOrder: number;
}

export interface ModelConfigurationParameters {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string[];
    [key: string]: unknown;
}

export interface ModelConfiguration {
    id: ID;
    modelId: ID;
    modelName?: string;
    modelProvider?: string;
    modelConfig: ModelConfigurationParameters;
    comment: string;
    createdAt: string;
}

export interface ModelCallRequest {
    modelConfigurationId: ID;
    prompt: string;
}

export interface ModelCallResponse {
    response: string;
}

export interface EntitySummary {
    id: ID;
    entityId: ID;
    summary: string;
    modelName: string;
    modelProvider: string;
    modelId: ID;
    modelConfigurationId: ID;
    modelConfig: ModelConfigurationParameters;
    configComment: string;
    createdAt: string;
}

export interface DetailedSummaryRecord {
    id: number;
    itemId: number;
    itemName: string;
    itemDetails?: string;
    content: string;
    modelName: string;
    modelProvider: string;
    modelId: number;
    modelConfigurationId: number;
    modelConfig: ModelConfigurationParameters;
    configComment: string;
    createdAt: string;
}
