// components/models/ModelInvoker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Package, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/app/lib/api';
import { ModelConfiguration } from '@/app/types';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import { useCollections } from '@/app/hooks/useCollections';
import type { CollectionWithEntities } from '@/app/lib/api/collections';
import { getAvailableOperations, getOperationById } from '@/app/lib/operations/registry';
import type { OperationResponse } from '@/app/types/operations';

type InvokeMode = 'prompt' | 'operation';

export default function ModelInvoker() {
    const [configs, setConfigs] = useState<ModelConfiguration[]>([]);
    const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
    const [collectionData, setCollectionData] = useState<CollectionWithEntities | null>(null);
    const [invokeMode, setInvokeMode] = useState<InvokeMode>('prompt');
    const [selectedOperationId, setSelectedOperationId] = useState<string>('');
    const [inputPrompt, setInputPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [operationResult, setOperationResult] = useState<OperationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);
    const [isLoadingCollection, setIsLoadingCollection] = useState(false);

    // Use collections hook
    const { collections, loading: collectionsLoading } = useCollections();

    // Get available operations based on whether a collection is selected
    const availableOperations = getAvailableOperations(!!collectionData);

    useEffect(() => {
        void fetchConfigurations();
    }, []);

    // Load collection data when selection changes
    useEffect(() => {
        const loadCollectionData = async () => {
            if (!selectedCollectionId) {
                setCollectionData(null);
                return;
            }

            setIsLoadingCollection(true);
            try {
                const data = await api.collections.getCollectionWithEntities(selectedCollectionId);
                setCollectionData(data);
                setError(null);
            } catch (err) {
                console.error('Failed to load collection data:', err);
                setError('Failed to load collection data');
                setCollectionData(null);
            } finally {
                setIsLoadingCollection(false);
            }
        };

        void loadCollectionData();
    }, [selectedCollectionId]);

    // Reset operation selection if collection is removed
    useEffect(() => {
        if (invokeMode === 'operation' && !collectionData) {
            setSelectedOperationId('');
        }
    }, [collectionData, invokeMode]);

    const fetchConfigurations = async () => {
        setIsLoadingConfigs(true);
        try {
            const res = await api.configs.getConfigurations();
            setConfigs(res);
            setError(null);
        } catch (err) {
            console.error('Error loading configurations:', err);
            setError('Failed to load model configurations');
        } finally {
            setIsLoadingConfigs(false);
        }
    };

    const handlePromptInvoke = async () => {
        if (!selectedConfigId) {
            setError("Please select a configuration");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse('');
        setOperationResult(null);

        try {
            // Build the final prompt with collection context if selected
            let finalPrompt = inputPrompt.trim() || "";

            if (collectionData) {
                const collectionContext = `\n\n--- Collection Context ---\n${JSON.stringify(collectionData, null, 2)}\n--- End Collection Context ---\n`;
                finalPrompt = finalPrompt + collectionContext;
            }

            const res = await api.models.invokeModel(selectedConfigId, finalPrompt);
            setResponse(res.response || 'Success');
            setError(null);
        } catch (err: any) {
            console.error('Error calling model:', err);
            const errorData = err.response?.data;

            if (typeof errorData === 'object' && errorData.message) {
                setError(`Error: ${errorData.message}`);
            } else if (typeof errorData === 'string') {
                setError(`Error: ${errorData}`);
            } else {
                setError('Failed to invoke model. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOperationInvoke = async () => {
        if (!selectedConfigId) {
            setError("Please select a configuration");
            return;
        }

        if (!selectedOperationId) {
            setError("Please select an operation");
            return;
        }

        if (!collectionData) {
            setError("Please select a collection for this operation");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse('');
        setOperationResult(null);

        try {
            let result: OperationResponse;

            if (selectedOperationId === 'summarize_each') {
                const summarizeEachResult = await api.operations.summarizeEach(
                    selectedConfigId,
                    collectionData.definition.id
                );
                result = {
                    operationId: 'summarize_each',
                    status: 'success',
                    message: `Successfully created ${summarizeEachResult.successCount} summaries`,
                    results: summarizeEachResult
                };
            } else if (selectedOperationId === 'summarize_group') {
                const summarizeGroupResult = await api.operations.summarizeGroup(
                    selectedConfigId,
                    collectionData.definition.id
                );
                result = {
                    operationId: 'summarize_group',
                    status: 'success',
                    message: `Successfully created collection summary`,
                    results: summarizeGroupResult
                };
            } else if (selectedOperationId === 'generate_relationships') {
                const relationshipsResult = await api.operations.generateRelationships(
                    selectedConfigId,
                    collectionData.definition.id
                );
                result = {
                    operationId: 'generate_relationships',
                    status: 'success',
                    message: `Successfully generated ${relationshipsResult.relationshipCount} relationships`,
                    results: relationshipsResult
                };
            } else {
                throw new Error(`Unknown operation: ${selectedOperationId}`);
            }

            setOperationResult(result);
            setError(null);
        } catch (err: any) {
            console.error('Error executing operation:', err);
            const errorMessage = err.message || 'Failed to execute operation';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getConfigDisplayName = (config: ModelConfiguration) => {
        const modelName = config.modelName || 'Unknown';
        const comment = config.comment ? `: ${config.comment}` : '';
        return `${modelName}${comment}`;
    };

    const renderCollectionPreview = () => {
        if (!collectionData) return null;

        return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center mb-2">
                    <Package size={16} className="mr-2 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Selected Collection</h4>
                </div>
                <div className="text-sm text-blue-800">
                    <p className="font-medium">{collectionData.definition.name}</p>
                    {collectionData.definition.description && (
                        <p className="text-blue-700 mt-1">{collectionData.definition.description}</p>
                    )}
                    <p className="text-blue-600 mt-1">
                        {collectionData.entities.length} entities
                        {invokeMode === 'prompt' && ' will be included in the context'}
                    </p>
                </div>

                {invokeMode === 'prompt' && (
                    <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-900">
                            Preview JSON Data
                        </summary>
                        <div className="mt-2 bg-white rounded border p-3 max-h-64 overflow-auto">
                            <pre className="text-xs text-gray-800">
                                {JSON.stringify(collectionData, null, 2)}
                            </pre>
                        </div>
                    </details>
                )}
            </div>
        );
    };

    const renderOperationResult = () => {
        if (!operationResult) return null;

        const operation = getOperationById(operationResult.operationId);
        const isSuccess = operationResult.status === 'success';

        return (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <div className="flex items-center mb-2">
                    {isSuccess ? (
                        <CheckCircle size={16} className="mr-2 text-green-600" />
                    ) : (
                        <AlertCircle size={16} className="mr-2 text-red-600" />
                    )}
                    <h3 className="font-medium">
                        {operation?.name || operationResult.operationId} - Result
                    </h3>
                </div>

                <p className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                    {operationResult.message}
                </p>

                {operationResult.results && (
                    <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                            View Details
                        </summary>
                        <div className="mt-2 bg-white rounded border p-3">
                            <pre className="text-xs text-gray-800">
                                {JSON.stringify(operationResult.results, null, 2)}
                            </pre>
                        </div>
                    </details>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-medium">Invoke Model</h3>
            </CardHeader>
            <CardBody>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Mode Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invoke Mode
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="prompt"
                                    checked={invokeMode === 'prompt'}
                                    onChange={(e) => setInvokeMode(e.target.value as InvokeMode)}
                                    className="mr-2"
                                />
                                Custom Prompt
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="operation"
                                    checked={invokeMode === 'operation'}
                                    onChange={(e) => setInvokeMode(e.target.value as InvokeMode)}
                                    className="mr-2"
                                />
                                Operations
                            </label>
                        </div>
                    </div>

                    {/* Configuration Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Configuration
                        </label>

                        {isLoadingConfigs ? (
                            <div className="mt-2 text-gray-500">Loading configurations...</div>
                        ) : configs.length === 0 ? (
                            <div className="mt-2 text-gray-500">
                                No configurations available. Please create one first.
                            </div>
                        ) : (
                            <select
                                value={selectedConfigId || ''}
                                onChange={e => setSelectedConfigId(e.target.value ? parseInt(e.target.value, 10) : null)}
                                className="input"
                                disabled={isLoading}
                            >
                                <option value="">-- Select a Configuration --</option>
                                {configs.map(cfg => (
                                    <option key={cfg.id} value={cfg.id}>
                                        {getConfigDisplayName(cfg)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Collection Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Collection {invokeMode === 'operation' && <span className="text-red-500">*</span>}
                        </label>

                        {collectionsLoading ? (
                            <div className="mt-2 text-gray-500">Loading collections...</div>
                        ) : (
                            <select
                                value={selectedCollectionId || ''}
                                onChange={e => setSelectedCollectionId(e.target.value ? parseInt(e.target.value, 10) : null)}
                                className="input"
                                disabled={isLoading || isLoadingCollection}
                            >
                                <option value="">-- No Collection --</option>
                                {collections.map(collection => (
                                    <option key={collection.id} value={collection.id}>
                                        {collection.name}
                                        {collection.description && ` - ${collection.description}`}
                                    </option>
                                ))}
                            </select>
                        )}

                        {isLoadingCollection && (
                            <div className="mt-1 text-sm text-gray-500">Loading collection data...</div>
                        )}
                    </div>

                    {/* Operation Selection - Only show in operation mode */}
                    {invokeMode === 'operation' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Operation <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedOperationId}
                                onChange={e => setSelectedOperationId(e.target.value)}
                                className="input"
                                disabled={isLoading || availableOperations.length === 0}
                            >
                                <option value="">-- Select an Operation --</option>
                                {availableOperations.map(operation => (
                                    <option key={operation.id} value={operation.id}>
                                        {operation.name} - {operation.description}
                                    </option>
                                ))}
                            </select>
                            {availableOperations.length === 0 && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Select a collection to see available operations
                                </p>
                            )}
                        </div>
                    )}

                    {/* Prompt Input - Only show in prompt mode */}
                    {invokeMode === 'prompt' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prompt (Optional)
                            </label>
                            <textarea
                                value={inputPrompt}
                                onChange={e => setInputPrompt(e.target.value)}
                                className="input"
                                rows={6}
                                placeholder="Enter prompt here (optional)"
                                disabled={isLoading}
                            ></textarea>
                            {collectionData && (
                                <p className="mt-1 text-sm text-blue-600">
                                    Collection data will be automatically appended to your prompt.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Collection Preview */}
                    {renderCollectionPreview()}

                    {/* Invoke Button */}
                    <div>
                        <button
                            onClick={invokeMode === 'prompt' ? handlePromptInvoke : handleOperationInvoke}
                            disabled={
                                isLoading ||
                                !selectedConfigId ||
                                configs.length === 0 ||
                                (invokeMode === 'operation' && (!selectedOperationId || !collectionData))
                            }
                            className={`btn flex items-center ${
                                isLoading ||
                                !selectedConfigId ||
                                configs.length === 0 ||
                                (invokeMode === 'operation' && (!selectedOperationId || !collectionData))
                                    ? 'bg-blue-300 text-white cursor-not-allowed'
                                    : 'btn-primary'
                            }`}
                        >
                            <Play size={16} className="mr-2" />
                            {isLoading ? 'Processing...' : invokeMode === 'prompt' ? 'Send' : 'Execute Operation'}
                        </button>
                    </div>

                    {/* Response Section - Only show for prompt mode */}
                    {invokeMode === 'prompt' && response && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-2">Response:</h3>
                            <div className="p-4 border rounded-md bg-gray-50">
                                <pre className="whitespace-pre-wrap">{response}</pre>
                            </div>
                        </div>
                    )}

                    {/* Operation Result Section - Only show for operation mode */}
                    {invokeMode === 'operation' && renderOperationResult()}
                </div>
            </CardBody>
        </Card>
    );
}
