// app/lib/api/models.ts
import axios from 'axios';
import { Model, ModelConfiguration, ModelParameter, ModelCallRequest, ModelCallResponse, DirectModelCallResponse } from '@/app/types';
import { API_URL } from '@/app/config';

export const getModels = async (): Promise<Model[]> => {
    const response = await axios.get<Model[]>(`${API_URL}/api/models`);
    return response.data;
};

export const createModel = async (modelData: Omit<Model, 'id'>): Promise<Model> => {
    const response = await axios.post<Model>(`${API_URL}/api/models`, modelData);
    return response.data;
};

export const getModelConfigurations = async (): Promise<ModelConfiguration[]> => {
    const response = await axios.get<ModelConfiguration[]>(`${API_URL}/api/model-configurations`);
    return response.data;
};

export const createModelConfiguration = async (configData: Omit<ModelConfiguration, 'id' | 'createdAt'>): Promise<ModelConfiguration> => {
    const response = await axios.post<ModelConfiguration>(`${API_URL}/api/model-configurations`, configData);
    return response.data;
};

export const getModelParameters = async (modelId: number): Promise<ModelParameter[]> => {
    const response = await axios.get<ModelParameter[]>(`${API_URL}/api/model-parameters/model/${modelId}`);
    return response.data;
};

export const invokeModel = async (modelConfigId: number, prompt: string): Promise<ModelCallResponse> => {
    const request: ModelCallRequest = {
        modelConfigurationId: modelConfigId,
        prompt
    };
    const response = await axios.post<ModelCallResponse>(`${API_URL}/api/batch-summary`, request);
    return response.data;
};

export const directModelCall = async (modelConfigId: number, prompt: string): Promise<DirectModelCallResponse> => {
    const request = {
        modelConfigurationId: modelConfigId,
        prompt
    };
    const response = await axios.post<DirectModelCallResponse>(`${API_URL}/api/model-call/direct`, request);
    return response.data;
};
