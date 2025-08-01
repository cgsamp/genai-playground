// components/prompts/PromptsList.tsx
'use client';

import { useState } from 'react';
import { Prompt, PromptType } from '@/app/types';
import { Search, Filter, Edit, Trash2, Calendar, User, Settings } from 'lucide-react';

interface PromptsListProps {
    prompts: Prompt[];
    promptTypes: PromptType[];
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: number) => void;
    onSearch: (term: string) => void;
    onTypeFilter: (typeId: number | null) => void;
    searchTerm: string;
    selectedTypeFilter: number | null;
    deleting: number | null;
}

export default function PromptsList({
    prompts,
    promptTypes,
    onEdit,
    onDelete,
    onSearch,
    onTypeFilter,
    searchTerm,
    selectedTypeFilter,
    deleting
}: PromptsListProps) {
    const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onTypeFilter(value === '' ? null : parseInt(value));
    };

    const toggleExpand = (promptId: number) => {
        setExpandedPrompt(expandedPrompt === promptId ? null : promptId);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (promptType: string) => {
        return promptType === 'SYSTEM' ? <Settings size={16} /> : <User size={16} />;
    };

    const getTypeBadgeColor = (promptType: string) => {
        return promptType === 'SYSTEM' 
            ? 'bg-purple-100 text-purple-800 border-purple-200' 
            : 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const truncateText = (text: string, maxLength: number = 150) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search prompts by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="relative min-w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        value={selectedTypeFilter || ''}
                        onChange={handleTypeFilterChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                        <option value="">All Types</option>
                        {promptTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.promptType}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600">
                {searchTerm || selectedTypeFilter !== null ? (
                    <p>Found {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}</p>
                ) : (
                    <p>Showing {prompts.length} active prompt{prompts.length !== 1 ? 's' : ''}</p>
                )}
            </div>

            {/* Prompts List */}
            {prompts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {searchTerm || selectedTypeFilter !== null ? (
                        <p>No prompts found matching your criteria.</p>
                    ) : (
                        <p>No prompts created yet. Create your first prompt to get started!</p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {prompts.map(prompt => (
                        <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {prompt.name}
                                            </h3>
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(prompt.type.promptType)}`}>
                                                {getTypeIcon(prompt.type.promptType)}
                                                {prompt.type.promptType}
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 mb-2">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Created: {formatDate(prompt.createdAt)}
                                                </span>
                                                {prompt.updatedAt !== prompt.createdAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        Updated: {formatDate(prompt.updatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-gray-700">
                                            {expandedPrompt === prompt.id ? (
                                                <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                                                    {prompt.text}
                                                </div>
                                            ) : (
                                                <p>{truncateText(prompt.text)}</p>
                                            )}
                                        </div>

                                        {prompt.text.length > 150 && (
                                            <button
                                                onClick={() => toggleExpand(prompt.id)}
                                                className="text-blue-500 hover:text-blue-600 text-sm mt-2"
                                            >
                                                {expandedPrompt === prompt.id ? 'Show Less' : 'Show More'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => onEdit(prompt)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit prompt"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(prompt.id)}
                                            disabled={deleting === prompt.id}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete prompt"
                                        >
                                            {deleting === prompt.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}