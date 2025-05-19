// app/lib/api/configs.ts
import axios from 'axios';
import { ModelConfiguration } from '@/app/types';
import { API_URL } from '@/app/config';

export const getConfigurations = async (): Promise<ModelConfiguration[]> => {
    const response = await axios.get<ModelConfiguration[]>(`${API_URL}/api/model-configurations`);
    return response.data;
};

export const getConfiguration = async (id: number): Promise<ModelConfiguration> => {
    const response = await axios.get<ModelConfiguration>(`${API_URL}/api/model-configurations/${id}`);
    return response.data;
};

export const createConfiguration = async (config: Omit<ModelConfiguration, 'id' | 'createdAt'>): Promise<ModelConfiguration> => {
    const response = await axios.post<ModelConfiguration>(`${API_URL}/api/model-configurations`, config);
    return response.data;
};
