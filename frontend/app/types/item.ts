import { ID, Attributes } from './common';

export interface Item {
    id: ID;
    itemType: string;
    name: string;
    description?: string;
    creator?: string;
    createdYear?: string;
    externalId?: string;
    source?: string;
    attributes: Attributes;
    createdAt: string;
    updatedAt: string;
}

export interface CreateItemRequest {
    itemType: string;
    name: string;
    description?: string;
    creator?: string;
    createdYear?: string;
    externalId?: string;
    source?: string;
    attributes?: Attributes;
}

export interface ItemSearchParams {
    itemType?: string;
    searchTerm?: string;
    creator?: string;
    createdYear?: string;
    source?: string;
}

export interface ItemSummary {
    id: ID;
    itemId: ID;
    itemName: string;
    itemDetails?: string;
    content: string;
    modelName: string;
    modelProvider: string;
    modelId: ID;
    modelConfigurationId: ID;
    modelConfig: Record<string, any>;
    configComment: string;
    createdAt: string;
}

export interface SelectedItem {
    id: number;
    itemType: string;
    name: string;
}
