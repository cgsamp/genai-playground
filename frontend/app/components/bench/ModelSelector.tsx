// components/bench/ModelSelector.tsx
'use client';

import { Cpu } from 'lucide-react';
import { ModelConfiguration } from '@/app/types';

interface ModelSelectorProps {
    modelConfigs: ModelConfiguration[];
    selectedConfigId: number | null;
    onSelect: (configId: number) => void;
}

export default function ModelSelector({ modelConfigs, selectedConfigId, onSelect }: ModelSelectorProps) {
    const selectedConfig = modelConfigs.find(c => c.id === selectedConfigId);

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Cpu size={12} />
                Model Configuration
            </label>
            <select
                value={selectedConfigId || ''}
                onChange={(e) => onSelect(parseInt(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Select configuration...</option>
                {modelConfigs.map(config => (
                    <option key={config.id} value={config.id}>
                        {config.modelName} - {config.comment || 'No description'}
                    </option>
                ))}
            </select>
            
            {selectedConfig && (
                <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                    <div className="grid grid-cols-2 gap-1">
                        <div><strong>Provider:</strong> {selectedConfig.modelProvider}</div>
                        <div><strong>Model:</strong> {selectedConfig.modelName}</div>
                    </div>
                    {selectedConfig.modelConfig && (
                        <div className="mt-1">
                            <strong>Config:</strong>
                            <div className="grid grid-cols-3 gap-1 mt-1">
                                {selectedConfig.modelConfig.temperature !== undefined && (
                                    <div>Temp: {selectedConfig.modelConfig.temperature}</div>
                                )}
                                {selectedConfig.modelConfig.max_tokens !== undefined && (
                                    <div>Max: {selectedConfig.modelConfig.max_tokens}</div>
                                )}
                                {selectedConfig.modelConfig.top_p !== undefined && (
                                    <div>Top-p: {selectedConfig.modelConfig.top_p}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}