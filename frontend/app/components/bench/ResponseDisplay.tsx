// components/bench/ResponseDisplay.tsx
'use client';

import { useState } from 'react';
import { Clock, Zap, Hash, AlertCircle, CheckCircle, Eye, EyeOff, DollarSign, MessageSquare, Cpu } from 'lucide-react';
import { ModelCallRecord } from '@/app/lib/api/modelCalls';
import { ModelConfiguration } from '@/app/types';

interface ResponseDisplayProps {
    response: string;
    callDetails: ModelCallRecord | null;
    responseMetadata?: any;
    isLoading: boolean;
    selectedConfig?: ModelConfiguration | null;
}

export default function ResponseDisplay({ response, callDetails, responseMetadata, isLoading, selectedConfig }: ResponseDisplayProps) {
    const [showRawJson, setShowRawJson] = useState(false);

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatTokenUsage = (tokenUsage: any) => {
        if (!tokenUsage) return null;
        
        return (
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-bold text-blue-800">{tokenUsage.prompt_tokens || 0}</div>
                    <div className="text-blue-600">Input</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-800">{tokenUsage.completion_tokens || 0}</div>
                    <div className="text-green-600">Output</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-bold text-purple-800">{tokenUsage.total_tokens || 0}</div>
                    <div className="text-purple-600">Total</div>
                </div>
            </div>
        );
    };

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    const calculateCost = () => {
        if (!selectedConfig || !callDetails?.tokenUsage) return null;
        
        const inputTokens = callDetails.tokenUsage.prompt_tokens || 0;
        const outputTokens = callDetails.tokenUsage.completion_tokens || 0;
        
        const inputCost = selectedConfig.costPer1kInputTokens ? (inputTokens / 1000) * selectedConfig.costPer1kInputTokens : 0;
        const outputCost = selectedConfig.costPer1kOutputTokens ? (outputTokens / 1000) * selectedConfig.costPer1kOutputTokens : 0;
        const totalCost = inputCost + outputCost;
        
        return {
            inputCost,
            outputCost,
            totalCost,
            inputTokens,
            outputTokens
        };
    };

    if (isLoading) {
        return (
            <div className="p-2 h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
                    <p className="text-[10px] text-gray-600">Calling model...</p>
                </div>
            </div>
        );
    }

    if (!response && !callDetails) {
        return (
            <div className="p-3 h-full flex items-center justify-center text-[10px] text-gray-500">
                <div className="text-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap size={16} className="text-gray-400" />
                    </div>
                    <p>Model response will appear here</p>
                    <p className="text-[9px] text-gray-400 mt-1">Select config and content, then call model</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with Status */}
            <div className="flex items-center justify-between bg-gray-900 text-white p-1">
                <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold">Results</span>
                    {callDetails && (
                        <div className="flex items-center gap-1">
                            {callDetails.success ? (
                                <><CheckCircle size={10} className="text-green-400" /><span className="text-green-400">Success</span></>
                            ) : (
                                <><AlertCircle size={10} className="text-red-400" /><span className="text-red-400">Failed</span></>
                            )}
                        </div>
                    )}
                </div>
                {callDetails && (
                    <div className="text-[9px] text-gray-300">
                        ID:{callDetails.id} | {formatDuration(callDetails.durationMs)} | {callDetails.modelName}
                    </div>
                )}
            </div>

            {/* Single Dense Content Area */}
            <div className="flex-1 overflow-auto p-2 space-y-2">
                {/* Model Response */}
                <div>
                    <div className="text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MessageSquare size={10} />
                        Response
                        {response && <span className="text-gray-500 ml-auto">{response.length} chars</span>}
                    </div>
                    {response ? (
                        <div className="bg-gray-50 p-2 rounded border font-mono text-[10px] whitespace-pre-wrap max-h-40 overflow-auto leading-tight">
                            {response}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4 text-[10px]">No response received</div>
                    )}
                </div>

                {callDetails && (
                    <>
                        {/* Timing, Tokens & Cost Combined */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <div className="text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Clock size={10} />
                                    Timing
                                </div>
                                <div className="bg-blue-50 p-1 rounded text-[9px] space-y-1">
                                    <div>Total: {formatDuration(callDetails.durationMs)}</div>
                                    <div>API: {formatDuration(callDetails.apiDurationMs)}</div>
                                    <div>Processing: {formatDuration(callDetails.processingDurationMs)}</div>
                                    <div className="text-[8px] text-gray-500">{formatTimestamp(callDetails.startTime)}</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Hash size={10} />
                                    Tokens
                                </div>
                                {(callDetails.tokenUsage || responseMetadata?.usage?.nativeUsage) ? (
                                    <div className="bg-green-50 p-1 rounded text-[9px] space-y-1">
                                        {responseMetadata?.usage?.nativeUsage ? (
                                            <>
                                                <div>Input: {responseMetadata.usage.nativeUsage.promptTokens || 0}</div>
                                                <div>Output: {responseMetadata.usage.nativeUsage.completionTokens || 0}</div>
                                                <div>Total: {responseMetadata.usage.nativeUsage.totalTokens || 0}</div>
                                            </>
                                        ) : callDetails.tokenUsage ? (
                                            <>
                                                <div>Input: {callDetails.tokenUsage.prompt_tokens || 0}</div>
                                                <div>Output: {callDetails.tokenUsage.completion_tokens || 0}</div>
                                                <div>Total: {callDetails.tokenUsage.total_tokens || 0}</div>
                                            </>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-1 rounded text-[9px] text-gray-500">No token data</div>
                                )}
                            </div>
                            <div>
                                <div className="text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <DollarSign size={10} />
                                    Cost
                                </div>
                                {(() => {
                                    const cost = calculateCost();
                                    return cost ? (
                                        <div className="bg-yellow-50 p-1 rounded text-[9px] space-y-1">
                                            <div>Input: ${cost.inputCost.toFixed(6)}</div>
                                            <div>Output: ${cost.outputCost.toFixed(6)}</div>
                                            <div className="font-bold">Total: ${cost.totalCost.toFixed(6)}</div>
                                            <div className="text-[8px] text-gray-500">
                                                ${selectedConfig?.costPer1kInputTokens || 0}/${selectedConfig?.costPer1kOutputTokens || 0}/1k
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-1 rounded text-[9px] text-gray-500">
                                            {selectedConfig ? 'No token data' : 'No cost data'}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Model & Config Info */}
                        <div>
                            <div className="text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Cpu size={10} />
                                Model & Config
                            </div>
                            <div className="bg-purple-50 p-1 rounded text-[9px] space-y-1">
                                <div>Model: {callDetails.modelName} ({callDetails.provider})</div>
                                <div>Config ID: {callDetails.modelConfigurationId} | Call ID: {callDetails.id}</div>
                                {callDetails.modelConfigurationJson && (
                                    <div className="text-[8px] text-gray-600">
                                        T:{callDetails.modelConfigurationJson.temperature || 'N/A'} | 
                                        MaxTok:{callDetails.modelConfigurationJson.max_tokens || 'N/A'} | 
                                        TopP:{callDetails.modelConfigurationJson.top_p || 'N/A'}
                                    </div>
                                )}
                                {selectedConfig?.contextLength && (
                                    <div className="text-[8px] text-blue-600">
                                        Context: {selectedConfig.contextLength.toLocaleString()} tokens | 
                                        Pricing: ${selectedConfig.costPer1kInputTokens || 'N/A'}/${selectedConfig.costPer1kOutputTokens || 'N/A'}/1k
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Raw Data Sections */}
                        <div className="space-y-2">
                            {/* Prompt */}
                            {callDetails.promptText && (
                                <div>
                                    <div className="text-[10px] font-medium text-gray-700 mb-1">Prompt Sent</div>
                                    <div className="bg-blue-50 p-1 rounded text-[9px] font-mono max-h-20 overflow-auto leading-tight">
                                        {callDetails.promptText}
                                    </div>
                                </div>
                            )}

                            {/* Response Metadata */}
                            {responseMetadata && (
                                <div>
                                    <div className="text-[10px] font-medium text-gray-700 mb-1 flex items-center justify-between">
                                        <span>Response Metadata</span>
                                        <button
                                            onClick={() => setShowRawJson(!showRawJson)}
                                            className="text-[8px] px-1 py-0 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            {showRawJson ? 'Hide' : 'Show'} JSON
                                        </button>
                                    </div>
                                    {showRawJson ? (
                                        <div className="bg-gray-900 text-green-400 p-1 rounded font-mono text-[8px] max-h-32 overflow-auto">
                                            <pre>{JSON.stringify(responseMetadata, null, 2)}</pre>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 p-1 rounded text-[9px]">
                                            Model: {responseMetadata.model || 'N/A'} | 
                                            Usage: {responseMetadata.usage ? 'Available' : 'None'}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Metadata */}
                            {callDetails.metadata && (
                                <div>
                                    <div className="text-[10px] font-medium text-gray-700 mb-1">Call Metadata</div>
                                    <div className="bg-gray-50 p-1 rounded text-[8px] font-mono max-h-16 overflow-auto">
                                        <pre>{JSON.stringify(callDetails.metadata, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Information */}
                        {!callDetails.success && callDetails.errorMessage && (
                            <div>
                                <div className="text-[10px] font-medium text-red-700 mb-1 flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    Error Details
                                </div>
                                <div className="bg-red-50 border border-red-200 p-1 rounded text-[9px]">
                                    <div className="font-medium text-red-800">Error:</div>
                                    <div className="text-red-700">{callDetails.errorMessage}</div>
                                    {callDetails.errorClass && (
                                        <div className="text-red-600 text-[8px] mt-1">Class: {callDetails.errorClass}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}