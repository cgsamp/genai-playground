// components/bench/PromptSelector.tsx
'use client';

import { MessageSquare, Settings, User } from 'lucide-react';
import { Prompt } from '@/app/types';

interface PromptSelectorProps {
    title: string;
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    onSelect: (prompt: Prompt | null) => void;
    placeholder: string;
}

export default function PromptSelector({ 
    title, 
    prompts, 
    selectedPrompt, 
    onSelect, 
    placeholder 
}: PromptSelectorProps) {
    const isSystemPrompt = title.includes('System');
    const icon = isSystemPrompt ? <Settings size={12} /> : <User size={12} />;

    const truncateText = (text: string, maxLength: number = 80) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                {icon}
                {title}
            </label>
            <select
                value={selectedPrompt?.id || ''}
                onChange={(e) => {
                    const promptId = parseInt(e.target.value);
                    const prompt = prompts.find(p => p.id === promptId) || null;
                    onSelect(prompt);
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">{placeholder}</option>
                {prompts.map(prompt => (
                    <option key={prompt.id} value={prompt.id}>
                        {prompt.name}
                    </option>
                ))}
            </select>
            
            {selectedPrompt && (
                <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                    <div className="font-medium mb-1">{selectedPrompt.name}</div>
                    <div className="text-gray-600 break-words">
                        {truncateText(selectedPrompt.text, 150)}
                    </div>
                    <div className="flex justify-between items-center text-gray-500 mt-1">
                        <span className={`px-1 rounded text-xs ${
                            isSystemPrompt 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                            {selectedPrompt.type.promptType}
                        </span>
                        <span>{selectedPrompt.text.length} chars</span>
                    </div>
                </div>
            )}
        </div>
    );
}