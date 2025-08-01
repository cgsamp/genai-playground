// components/bench/UserContentInput.tsx
'use client';

import { Edit3 } from 'lucide-react';

interface UserContentInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
}

export default function UserContentInput({ 
    value, 
    onChange, 
    placeholder, 
    disabled = false 
}: UserContentInputProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Edit3 size={12} />
                User Content
                <span className="text-gray-500 ml-auto">
                    {value.length} characters
                </span>
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                rows={4}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                <span>Will be combined with selected prompts above</span>
                {value.includes('{') && value.includes('}') && (
                    <span className="text-orange-600">Placeholders detected</span>
                )}
            </div>
        </div>
    );
}