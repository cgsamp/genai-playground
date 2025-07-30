// frontend/app/hooks/useSummaries.ts
'use client';

import { useState, useEffect } from 'react';
import { useApiError } from './useApiError';
import { API_URL } from '@/app/config';
import axios from 'axios';

interface DetailedSummaryRecord {
    id: number;
    itemId: number;
    itemName: string;
    itemDetails?: string;
    content: string;
    modelName: string;
    modelProvider: string;
    modelId: number;
    modelConfigurationId: number;
    modelConfig: any;
    configComment: string;
    createdAt: string;
}

export function useSummaries() {
    const [summaries, setSummaries] = useState<DetailedSummaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { error, handleApiError, clearError } = useApiError();

    const fetchSummaries = async () => {
        clearError();
        setLoading(true);
        try {
            const response = await axios.get<DetailedSummaryRecord[]>(`${API_URL}/api/summaries`);
            setSummaries(response.data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummariesForItems = async (itemIds: number[]) => {
        clearError();
        setLoading(true);
        try {
            const response = await axios.get<DetailedSummaryRecord[]>(
                `${API_URL}/api/summaries/items?itemIds=${itemIds.join(',')}`
            );
            setSummaries(response.data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummariesByBatch = async (batchId: number) => {
        clearError();
        setLoading(true);
        try {
            const response = await axios.get<DetailedSummaryRecord[]>(
                `${API_URL}/api/summaries/batch/${batchId}`
            );
            setSummaries(response.data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummariesByModelConfig = async (modelConfigId: number) => {
        clearError();
        setLoading(true);
        try {
            const response = await axios.get<DetailedSummaryRecord[]>(
                `${API_URL}/api/summaries/model-config/${modelConfigId}`
            );
            setSummaries(response.data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchSummaries();
    }, []);

    return {
        summaries,
        loading,
        error,
        refreshSummaries: fetchSummaries,
        fetchSummariesForItems,
        fetchSummariesByBatch,
        fetchSummariesByModelConfig
    };
}
