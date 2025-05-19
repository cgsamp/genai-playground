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

export interface ModelConfiguration {
    id: ID;
    modelId: ID;
    modelName?: string;
    modelProvider?: string;
    modelConfig: Record<string, any>;
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
    modelConfig: Record<string, any>;
    configComment: string;
    createdAt: string;
}
