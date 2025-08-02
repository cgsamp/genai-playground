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
    availableHeight?: number;
}

export default function PromptSelector({ 
    title, 
    prompts, 
    selectedPrompt, 
    onSelect, 
    placeholder,
    availableHeight = 200
}: PromptSelectorProps) {
    const isSystemPrompt = title.includes('System');
    const icon = isSystemPrompt ? <Settings size={10} /> : <User size={10} />;

    // Calculate dynamic heights
    const selectHeight = Math.max(60, availableHeight * 0.4);
    const previewHeight = availableHeight - selectHeight - 40; // 40px for label and margins

    return (
        <div className="h-full flex flex-col">
            <label className="block text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1 leading-tight">
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
                className="w-full px-1 py-1 text-[9px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono leading-tight overflow-auto"
                style={{ height: `${selectHeight}px` }}
                size={Math.floor(selectHeight / 20)}
            >
                <option value="" className="text-[9px]">{placeholder}</option>
                {prompts.map(prompt => (
                    <option key={prompt.id} value={prompt.id} className="text-[9px] py-1">
                        [{prompt.id}] {prompt.name} | {prompt.text.length}ch | {prompt.text.substring(0, 50)}{prompt.text.length > 50 ? '...' : ''}
                    </option>
                ))}
            </select>
            
            {selectedPrompt && previewHeight > 30 && (
                <div 
                    className="mt-1 p-1 bg-gray-100 rounded text-[9px] leading-tight overflow-auto flex-1"
                    style={{ maxHeight: `${previewHeight}px` }}
                >
                    <div className="font-medium text-gray-800">
                        [{selectedPrompt.id}] {selectedPrompt.name}
                    </div>
                    <div className="text-gray-600 break-words mt-0.5 whitespace-pre-wrap">
                        {selectedPrompt.text}
                    </div>
                    <div className="flex justify-between items-center text-gray-500 mt-1 flex-wrap">
                        <span className={`px-1 rounded text-[8px] ${
                            isSystemPrompt 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                            {selectedPrompt.type.promptType}
                        </span>
                        <span className="text-[8px]">{selectedPrompt.text.length} chars</span>
                    </div>
                    <div className="text-gray-400 text-[8px] mt-0.5">
                        Created: {new Date(selectedPrompt.createdAt).toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
}