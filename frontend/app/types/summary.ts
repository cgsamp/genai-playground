import {Attributes} from "@/app/types/common";

export interface Summary {
    id: number;
    entityId: number;
    entityType: string;
    content: string;
    createdAt: string;
    attributes: Attributes;
}

export interface DetailedSummary {
    id: number;
    entityId: number;
    entityType: string;
    entityName?: string;
    entityDetails?: string;
    content: string;
    modelName: string;
    modelProvider: string;
    modelId: number;
    modelConfigurationId: number;
    modelConfig: any;
    configComment: string;
    createdAt: string;
    attributes: Attributes;
}
