import {Attributes} from "@/app/types/common";
import type {DetailedSummary} from "@/app/types/summary";

export interface Relationship {
    id: number;
    name: string;
    relationshipType : string;
    sourceType: string;
    sourceId: number;
    targetType: string;
    targetId :number;
    createdAt: string;
    updatedAt: string;
    attributes: Attributes;
}

export interface RelatedItems {
    relationships: Relationship[];
    summaries: DetailedSummary[];
}
