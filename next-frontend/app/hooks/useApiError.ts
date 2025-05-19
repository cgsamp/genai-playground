// hooks/useApiError.ts
'use client';

import { useState } from 'react';
import { ApiError } from '@/app/types';

export function useApiError() {
    const [error, setError] = useState<ApiError | null>(null);

    const handleApiError = (err: unknown) => {
        if (axios.isAxiosError(err) && err.response) {
            setError({
                status: err.response.status,
                message: err.response.data?.message || err.message,
                details: err.response.data?.details,
            });
        } else if (err instanceof Error) {
            setError({
                status: 500,
                message: err.message,
            });
        } else {
            setError({
                status: 500,
                message: 'An unknown error occurred',
            });
        }
    };

    const clearError = () => setError(null);

    return { error, handleApiError, clearError };
}
