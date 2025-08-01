// hooks/useApiError.ts
'use client';

import { useState } from 'react';
import axios from 'axios';
import { ErrorState, ApiError } from '@/app/types/error';

export function useApiError() {
    const [error, setError] = useState<ErrorState | null>(null);

    const handleApiError = (err: unknown, context?: { method?: string; url?: string }) => {
        if (axios.isAxiosError(err) && err.response) {
            const apiError: ApiError = err.response.data;
            const errorState: ErrorState = {
                message: apiError?.message || err.message || 'An API error occurred',
                code: apiError?.errorCode,
                status: err.response.status,
            };
            
            console.error('API Error:', {
                ...context,
                status: err.response.status,
                message: errorState.message,
                code: errorState.code,
                timestamp: new Date().toISOString()
            });
            
            setError(errorState);
        } else if (err instanceof Error) {
            const errorState: ErrorState = {
                message: err.message,
                status: 500,
            };
            
            console.error('Error:', {
                ...context,
                message: err.message,
                stack: err.stack,
                timestamp: new Date().toISOString()
            });
            
            setError(errorState);
        } else {
            const errorState: ErrorState = {
                message: 'An unknown error occurred',
                status: 500,
            };
            
            console.error('Unknown Error:', {
                ...context,
                error: err,
                timestamp: new Date().toISOString()
            });
            
            setError(errorState);
        }
    };

    const clearError = () => setError(null);

    return { error, handleApiError, clearError };
}
