// app/lib/api/cytoscape.ts
import axios from 'axios';
import { API_URL } from '@/app/config';

export const getCytoscapeData = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/api/cytoscape/items-summaries`);
    return response.data;
};

export const getItemsRelationshipsGraph = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/api/cytoscape/items-relationships`);
    return response.data;
};

export const getComprehensiveGraph = async (maxItems: number = 100, itemTypes?: string[]): Promise<any> => {
    const params = new URLSearchParams();
    params.append('maxItems', maxItems.toString());
    if (itemTypes && itemTypes.length > 0) {
        itemTypes.forEach(type => params.append('itemTypes', type));
    }
    const response = await axios.get(`${API_URL}/api/cytoscape/comprehensive?${params.toString()}`);
    return response.data;
};

export const getAvailableItemTypes = async (): Promise<string[]> => {
    const response = await axios.get(`${API_URL}/api/cytoscape/item-types`);
    return response.data;
};

export const getGraphStats = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/api/cytoscape/stats`);
    return response.data;
};
