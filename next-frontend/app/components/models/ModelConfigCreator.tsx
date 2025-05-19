// components/models/ModelConfigCreator.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { Model, ModelParameter } from '@/app/types/model';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';

export default function ModelConfigCreator() {
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<number | ''>('');
    const [modelParameters, setModelParameters] = useState<ModelParameter[]>([]);
    const [modelConfig, setModelConfig] = useState({
        temperature: '',
        top_p: '',
        max_tokens: ''
    });
    const [comment, setComment] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [isLoading, setIsLoading] = useState(false);

    // @ts-ignore
    useEffect(() => {
        void fetchModels();
    }, []);

    // @ts-ignore
    useEffect(() => {
        // @ts-ignore
        if (selectedModelId && selectedModelId !== '') {
            void fetchModelParameters(selectedModelId as number);
        } else {
            setModelParameters([]);
        }
    }, [selectedModelId]);

    const fetchModels = async () => {
        try {
            const response = await api.models.getModels();
            setModels(response);
        } catch (err) {
            console.error('Error loading models:', err);
            setStatusMessage('Failed to load models');
            setMessageType('error');
        }
    };

    const fetchModelParameters = async (modelId: number) => {
        try {
            const response = await api.models.getModelParameters(modelId);
            setModelParameters(response);

            // Initialize form with default values
            const defaults: Record<string, string> = {};
            response.forEach(param => {
                if (param.defaultValue) {
                    defaults[param.paramName] = param.defaultValue;
                }
            });

            setModelConfig({
                temperature: defaults.temperature || '',
                top_p: defaults.top_p || '',
                max_tokens: defaults.max_tokens || ''
            });
        } catch (err) {
            console.error('Error loading model parameters:', err);
            setModelParameters([]);
        }
    };

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setModelConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!selectedModelId) {
            setStatusMessage('Please select a model');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        try {
            await api.models.createModelConfiguration({
                modelId: selectedModelId as number,
                modelConfig: {
                    temperature: parseFloat(modelConfig.temperature),
                    top_p: parseFloat(modelConfig.top_p),
                    max_tokens: parseInt(modelConfig.max_tokens, 10)
                },
                comment
            });

            setStatusMessage('Model configuration saved successfully!');
            setMessageType('success');
            setSelectedModelId('');
            setModelConfig({ temperature: '', top_p: '', max_tokens: '' });
            setComment('');
        } catch (error) {
            console.error('Error saving configuration:', error);
            setStatusMessage('Failed to save configuration');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    // Find parameter by name for getting guidance info
    const getParameterInfo = (paramName: string) => {
        return modelParameters.find(param => param.paramName === paramName) || null;
    };

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-medium">Create Model Configuration</h3>
            </CardHeader>
            <CardBody>
                {statusMessage && (
                    <div className={`mb-4 p-3 rounded-md ${
                        messageType === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {statusMessage}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Model</label>
                        <select
                            value={selectedModelId}
                            onChange={e => setSelectedModelId(e.target.value ? parseInt(e.target.value, 10) : '')}
                            className="input"
                        >
                            <option value="">-- Select a Model --</option>
                            {models.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.modelName} ({model.modelProvider})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedModelId && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="temperature"
                                        value={modelConfig.temperature}
                                        onChange={handleConfigChange}
                                        className="input max-w-xs"
                                    />
                                    {getParameterInfo('temperature')?.description && (
                                        <div className="ml-4 text-sm text-gray-500">
                                            {getParameterInfo('temperature')?.description}
                                            {getParameterInfo('temperature')?.minValue && getParameterInfo('temperature')?.maxValue && (
                                                <span className="block mt-1">
                          Range: {getParameterInfo('temperature')?.minValue} - {getParameterInfo('temperature')?.maxValue}
                        </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Top P</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="top_p"
                                        value={modelConfig.top_p}
                                        onChange={handleConfigChange}
                                        className="input max-w-xs"
                                    />
                                    {getParameterInfo('top_p')?.description && (
                                        <div className="ml-4 text-sm text-gray-500">
                                            {getParameterInfo('top_p')?.description}
                                            {getParameterInfo('top_p')?.minValue && getParameterInfo('top_p')?.maxValue && (
                                                <span className="block mt-1">
                          Range: {getParameterInfo('top_p')?.minValue} - {getParameterInfo('top_p')?.maxValue}
                        </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        name="max_tokens"
                                        value={modelConfig.max_tokens}
                                        onChange={handleConfigChange}
                                        className="input max-w-xs"
                                    />
                                    {getParameterInfo('max_tokens')?.description && (
                                        <div className="ml-4 text-sm text-gray-500">
                                            {getParameterInfo('max_tokens')?.description}
                                            {getParameterInfo('max_tokens')?.minValue && getParameterInfo('max_tokens')?.maxValue && (
                                                <span className="block mt-1">
                          Range: {getParameterInfo('max_tokens')?.minValue} - {getParameterInfo('max_tokens')?.maxValue}
                        </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    className="input"
                                    rows={3}
                                    placeholder="Add a description for this configuration"
                                ></textarea>
                            </div>

                            <div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="btn btn-primary"
                                >
                                    {isLoading ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
