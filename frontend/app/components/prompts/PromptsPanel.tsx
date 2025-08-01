// components/prompts/PromptsPanel.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Loading from '@/app/components/ui/Loading';
import ErrorDisplay from '@/app/components/ui/ErrorDisplay';
import { usePrompts } from '@/app/hooks/usePrompts';
import PromptForm from './PromptForm';
import PromptsList from './PromptsList';
import { Prompt } from '@/app/types';

export default function PromptsPanel() {
    const {
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
        refreshPrompts,
        clearError
    } = usePrompts();

    const [showForm, setShowForm] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | null>(null);
    const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);

    const handleCreatePrompt = async (promptData: { name: string; text: string; typeId: number }) => {
        try {
            await createPrompt(promptData);
            setShowForm(false);
            clearError();
        } catch (err) {
            // Error is handled by the hook
        }
    };

    const handleUpdatePrompt = async (id: number, promptData: { name: string; text: string; typeId: number }) => {
        try {
            await updatePrompt(id, promptData);
            setEditingPrompt(null);
            setShowForm(false);
            clearError();
        } catch (err) {
            // Error is handled by the hook
        }
    };

    const handleDeletePrompt = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
            try {
                await deletePrompt(id);
                clearError();
            } catch (err) {
                // Error is handled by the hook
            }
        }
    };

    const handleEditPrompt = (prompt: Prompt) => {
        setEditingPrompt(prompt);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingPrompt(null);
        clearError();
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.trim()) {
            try {
                const results = await searchPrompts(term);
                setFilteredPrompts(results);
                setSelectedTypeFilter(null);
            } catch (err) {
                // Error is handled by the hook
            }
        } else {
            setFilteredPrompts([]);
        }
    };

    const handleTypeFilter = async (typeId: number | null) => {
        setSelectedTypeFilter(typeId);
        if (typeId !== null) {
            try {
                const results = await getPromptsByType(typeId);
                setFilteredPrompts(results);
                setSearchTerm('');
            } catch (err) {
                // Error is handled by the hook
            }
        } else {
            setFilteredPrompts([]);
            setSearchTerm('');
        }
    };

    const displayPrompts = searchTerm || selectedTypeFilter !== null ? filteredPrompts : prompts;

    if (loading) {
        return <Loading message="Loading prompts..." />;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Prompt Management</h2>
                        <button
                            onClick={() => setShowForm(true)}
                            disabled={creating}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create New Prompt'}
                        </button>
                    </div>
                </CardHeader>
                <CardBody>
                    {error && <ErrorDisplay error={error} />}
                    
                    {showForm && (
                        <div className="mb-6">
                            <PromptForm
                                promptTypes={promptTypes}
                                editingPrompt={editingPrompt}
                                onSubmit={editingPrompt ? 
                                    (data) => handleUpdatePrompt(editingPrompt.id, data) : 
                                    handleCreatePrompt
                                }
                                onCancel={handleCancelForm}
                                submitting={creating || updating}
                            />
                        </div>
                    )}

                    <PromptsList
                        prompts={displayPrompts}
                        promptTypes={promptTypes}
                        onEdit={handleEditPrompt}
                        onDelete={handleDeletePrompt}
                        onSearch={handleSearch}
                        onTypeFilter={handleTypeFilter}
                        searchTerm={searchTerm}
                        selectedTypeFilter={selectedTypeFilter}
                        deleting={deleting}
                    />
                </CardBody>
            </Card>
        </div>
    );
}