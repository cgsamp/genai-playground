// frontend/app/hooks/useSummaries.ts
'use client';

import { useState, useEffect } from 'react';
import { useApiError } from './useApiError';
import { API_URL } from '@/app/config';
import { DetailedSummaryRecord } from '@/app/types/model';
import axios from 'axios';

export function useSummaries() {
    const [summaries, setSummaries] = useState<DetailedSummaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { error, handleApiError, clearError } = useApiError();

    const fetchSummaries = async () => {
        clearError();
        setLoading(true);
        const startTime = Date.now();
        
        try {
            console.info('Fetching summaries from API');
            const response = await axios.get<DetailedSummaryRecord[]>(`${API_URL}/api/summaries`);
            
            const duration = Date.now() - startTime;
            console.info(`Successfully fetched ${response.data.length} summaries in ${duration}ms`);
            
            setSummaries(response.data);
        } catch (err) {
            const duration = Date.now() - startTime;
            console.error(`Failed to fetch summaries after ${duration}ms`);
            handleApiError(err, { method: 'GET', url: '/api/summaries' });
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
