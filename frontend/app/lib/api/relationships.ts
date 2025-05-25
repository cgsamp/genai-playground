import axios from 'axios';
import { API_URL } from '@/app/config';

export interface RelationshipRecord {
    id: number;
    name: string;
    relationshipType: string;
    sourceItemId: number;
    targetItemId: number;
    attributes?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export const getAllRelationships = async (): Promise<RelationshipRecord[]> => {
    const response = await axios.get<RelationshipRecord[]>(`${API_URL}/api/relationships`);
    return response.data;
};

export const getRelationshipsForItem = async (itemId: number): Promise<RelationshipRecord[]> => {
    const response = await axios.get<RelationshipRecord[]>(`${API_URL}/api/relationships/item/${itemId}`);
    return response.data;
};

export const getRelationshipsByType = async (relationshipType: string): Promise<RelationshipRecord[]> => {
    const response = await axios.get<RelationshipRecord[]>(`${API_URL}/api/relationships/type/${relationshipType}`);
    return response.data;
};

export const getCollectionRelationships = async (collectionId: number): Promise<RelationshipRecord[]> => {
    const response = await axios.get<RelationshipRecord[]>(`${API_URL}/api/relationships/collection/${collectionId}`);
    return response.data;
};

export const createRelationship = async (relationship: Omit<RelationshipRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RelationshipRecord> => {
    const response = await axios.post<RelationshipRecord>(`${API_URL}/api/relationships`, relationship);
    return response.data;
};

export const deleteRelationship = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/relationships/${id}`);
};
