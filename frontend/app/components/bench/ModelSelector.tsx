// components/bench/ModelSelector.tsx
'use client';

import { Cpu } from 'lucide-react';
import { ModelConfiguration } from '@/app/types';

interface ModelSelectorProps {
    modelConfigs: ModelConfiguration[];
    selectedConfigId: number | null;
    onSelect: (configId: number) => void;
    availableHeight?: number;
}

export default function ModelSelector({ modelConfigs, selectedConfigId, onSelect, availableHeight = 200 }: ModelSelectorProps) {
    const selectedConfig = modelConfigs.find(c => c.id === selectedConfigId);
    
    // Calculate dynamic heights
    const selectHeight = Math.max(60, availableHeight * 0.4);
    const previewHeight = availableHeight - selectHeight - 40; // 40px for label and margins

    return (
        <div className="h-full flex flex-col">
            <label className="block text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1 leading-tight">
                <Cpu size={10} />
                Model Configuration
            </label>
            <select
                value={selectedConfigId || ''}
                onChange={(e) => onSelect(parseInt(e.target.value))}
                className="w-full px-1 py-1 text-[9px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono leading-tight overflow-auto"
                style={{ height: `${selectHeight}px` }}
                size={Math.floor(selectHeight / 20)}
            >
                <option value="" className="text-[9px]">Select config...</option>
                {modelConfigs.map(config => (
                    <option key={config.id} value={config.id} className="text-[9px] py-1">
                        [{config.id}] {config.modelName} | {config.modelProvider} | T:{config.modelConfig?.temperature || 'N/A'} MaxTok:{config.modelConfig?.max_tokens || 'N/A'} TopP:{config.modelConfig?.top_p || 'N/A'} | ${config.costPer1kInputTokens || 'N/A'}/${config.costPer1kOutputTokens || 'N/A'}/1k | {config.comment || 'No desc'}
                    </option>
                ))}
            </select>
            
            {selectedConfig && previewHeight > 30 && (
                <div 
                    className="mt-1 p-1 bg-gray-100 rounded text-[9px] leading-tight overflow-auto flex-1"
                    style={{ maxHeight: `${previewHeight}px` }}
                >
                    <div className="font-medium text-gray-800">
                        [{selectedConfig.id}] {selectedConfig.modelName} ({selectedConfig.modelProvider})
                    </div>
                    <div className="text-gray-600 mt-0.5 break-words">
                        {selectedConfig.comment || 'No description'}
                    </div>
                    {selectedConfig.modelConfig && (
                        <div className="mt-1 text-gray-500 break-words">
                            T:{selectedConfig.modelConfig.temperature || 'N/A'} | 
                            MaxTok:{selectedConfig.modelConfig.max_tokens || 'N/A'} | 
                            TopP:{selectedConfig.modelConfig.top_p || 'N/A'} | 
                            FreqPen:{selectedConfig.modelConfig.frequency_penalty || 'N/A'} | 
                            PresPen:{selectedConfig.modelConfig.presence_penalty || 'N/A'}
                        </div>
                    )}
                    {(selectedConfig.costPer1kInputTokens || selectedConfig.costPer1kOutputTokens || selectedConfig.contextLength) && (
                        <div className="mt-1 text-blue-600 break-words text-[9px] font-medium">
                            Cost: ${selectedConfig.costPer1kInputTokens || 'N/A'}/${selectedConfig.costPer1kOutputTokens || 'N/A'}/1k tokens | 
                            Context: {selectedConfig.contextLength ? `${selectedConfig.contextLength.toLocaleString()}` : 'N/A'} tokens
                        </div>
                    )}
                    <div className="text-gray-400 text-[8px] mt-0.5">
                        Created: {new Date(selectedConfig.createdAt).toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
}