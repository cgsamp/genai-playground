// components/bench/UserContentInput.tsx
'use client';

import { Edit3 } from 'lucide-react';

interface UserContentInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
    availableHeight?: number;
}

export default function UserContentInput({ 
    value, 
    onChange, 
    placeholder, 
    disabled = false,
    availableHeight = 120
}: UserContentInputProps) {
    const textAreaHeight = Math.max(60, availableHeight - 40); // 40px for label and footer
    
    return (
        <div className="h-full flex flex-col">
            <label className="block text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1 leading-tight">
                <Edit3 size={10} />
                User Content
                <span className="text-gray-500 ml-auto">
                    {value.length} chars
                </span>
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-1 py-1 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono disabled:bg-gray-100 disabled:cursor-not-allowed leading-tight flex-1"
                style={{ height: `${textAreaHeight}px` }}
            />
            <div className="flex justify-between items-center mt-1 text-[9px] text-gray-500">
                <span>Combined with prompts above</span>
                {value.includes('{') && value.includes('}') && (
                    <span className="text-orange-600">Placeholders detected</span>
                )}
            </div>
        </div>
    );
}