// frontend/app/lib/api/items.ts
import axios from 'axios';
import { API_URL } from '@/app/config';

export interface Item {
    id: number;
    itemType: string;
    name: string;
    description?: string;
    creator?: string;
    createdYear?: string;
    externalId?: string;
    source?: string;
    attributes: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface ItemSummary {
    id: number;
    itemId: number;
    itemName: string;
    itemDetails?: string;
    content: string;
    modelName: string;
    modelProvider: string;
    modelId: number;
    modelConfigurationId: number;
    modelConfig: Record<string, any>;
    configComment: string;
    createdAt: string;
}

export const getItems = async (itemType?: string): Promise<Item[]> => {
    const url = itemType
        ? `${API_URL}/api/items?itemType=${itemType}`
        : `${API_URL}/api/items`;
    const response = await axios.get<Item[]>(url);
    return response.data;
};

export const getItem = async (id: number): Promise<Item> => {
    const response = await axios.get<Item>(`${API_URL}/api/items/${id}`);
    return response.data;
};

export const createItem = async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    const response = await axios.post<Item>(`${API_URL}/api/items`, item);
    return response.data;
};

export const updateItem = async (id: number, item: Partial<Item>): Promise<Item> => {
    const response = await axios.put<Item>(`${API_URL}/api/items/${id}`, item);
    return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/items/${id}`);
};

export const searchItems = async (itemType?: string, searchTerm?: string): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (itemType) params.append('itemType', itemType);
    if (searchTerm) params.append('searchTerm', searchTerm);

    const response = await axios.get<Item[]>(`${API_URL}/api/items/search?${params}`);
    return response.data;
};

export const getItemSummaries = async (itemIds: number[]): Promise<ItemSummary[]> => {
    const response = await axios.get<ItemSummary[]>(
        `${API_URL}/api/summaries/items?itemIds=${itemIds.join(',')}`
    );
    return response.data;
};

export const getItemTypes = async (): Promise<string[]> => {
    const response = await axios.get<string[]>(`${API_URL}/api/items/types`);
    return response.data;
};
