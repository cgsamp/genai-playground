import {Attributes} from "@/app/types/common";

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
