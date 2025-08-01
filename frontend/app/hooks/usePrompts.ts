// hooks/usePrompts.ts
'use client';

import { useState, useEffect } from 'react';
import { Prompt, PromptType } from '@/app/types';
import { api } from '@/app/lib/api';
import { useApiError } from './useApiError';

export function usePrompts() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [promptTypes, setPromptTypes] = useState<PromptType[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const { error, handleApiError, clearError } = useApiError();

    const fetchPrompts = async () => {
        clearError();
        setLoading(true);
        try {
            const [promptsData, typesData] = await Promise.all([
                api.prompts.getPrompts(),
                api.prompts.getPromptTypes()
            ]);
            setPrompts(promptsData);
            setPromptTypes(typesData);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const createPrompt = async (promptData: { name: string; text: string; typeId: number }) => {
        clearError();
        setCreating(true);
        try {
            const newPrompt = await api.prompts.createPrompt(promptData);
            setPrompts(prev => [newPrompt, ...prev]);
            return newPrompt;
        } catch (err) {
            handleApiError(err);
            throw err;
        } finally {
            setCreating(false);
        }
    };

    const updatePrompt = async (id: number, promptData: { name: string; text: string; typeId: number }) => {
        clearError();
        setUpdating(true);
        try {
            const updatedPrompt = await api.prompts.updatePrompt(id, promptData);
            // Remove the old prompt and add the new one (immutable update pattern)
            setPrompts(prev => prev.filter(p => p.id !== id));
            setPrompts(prev => [updatedPrompt, ...prev]);
            return updatedPrompt;
        } catch (err) {
            handleApiError(err);
            throw err;
        } finally {
            setUpdating(false);
        }
    };

    const deletePrompt = async (id: number) => {
        clearError();
        setDeleting(id);
        try {
            await api.prompts.deletePrompt(id);
            // Remove from active list (soft deleted)
            setPrompts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            handleApiError(err);
            throw err;
        } finally {
            setDeleting(null);
        }
    };

    const searchPrompts = async (name: string) => {
        clearError();
        try {
            const searchResults = await api.prompts.searchPrompts(name);
            return searchResults;
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    const getPromptsByType = async (typeId: number) => {
        clearError();
        try {
            const filteredPrompts = await api.prompts.getPromptsByType(typeId);
            return filteredPrompts;
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    return {
        prompts,
        promptTypes,
        loading,
        creating,
        updating,
        deleting,
        error,
        createPrompt,
        updatePrompt,
        deletePrompt,
        searchPrompts,
        getPromptsByType,
        refreshPrompts: fetchPrompts,
        clearError
    };
}