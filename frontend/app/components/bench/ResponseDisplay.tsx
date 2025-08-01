// components/bench/ResponseDisplay.tsx
'use client';

import { useState } from 'react';
import { Clock, Zap, Hash, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { ModelCallRecord } from '@/app/lib/api/modelCalls';

interface ResponseDisplayProps {
    response: string;
    callDetails: ModelCallRecord | null;
    responseMetadata?: any;
    isLoading: boolean;
}

export default function ResponseDisplay({ response, callDetails, responseMetadata, isLoading }: ResponseDisplayProps) {
    const [showRawJson, setShowRawJson] = useState(false);
    const [activeTab, setActiveTab] = useState<'response' | 'details' | 'raw'>('response');

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

    if (isLoading) {
        return (
            <div className="p-4 h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Calling model...</p>
                </div>
            </div>
        );
    }

    if (!response && !callDetails) {
        return (
            <div className="p-4 h-full flex items-center justify-center text-xs text-gray-500">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap size={24} className="text-gray-400" />
                    </div>
                    <p>Model response will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">Select configuration and content, then click "Call Model"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex bg-gray-100 border-b">
                <button
                    onClick={() => setActiveTab('response')}
                    className={`px-3 py-2 text-xs font-medium ${
                        activeTab === 'response'
                            ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Response
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-2 text-xs font-medium ${
                        activeTab === 'details'
                            ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Details
                </button>
                <button
                    onClick={() => setActiveTab('raw')}
                    className={`px-3 py-2 text-xs font-medium ${
                        activeTab === 'raw'
                            ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Raw Data
                </button>
                
                {/* Success indicator */}
                {callDetails && (
                    <div className="ml-auto flex items-center px-3 py-2">
                        {callDetails.success ? (
                            <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle size={12} />
                                <span className="text-xs">Success</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle size={12} />
                                <span className="text-xs">Failed</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'response' && (
                    <div className="p-3">
                        {response ? (
                            <div className="bg-gray-50 p-3 rounded border font-mono text-xs whitespace-pre-wrap">
                                {response}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No response received</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="p-3 space-y-4">
                        {callDetails ? (
                            <>
                                {/* Timing Information */}
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                                        <Clock size={12} />
                                        Timing
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Total Duration</div>
                                            <div className="text-gray-600">{formatDuration(callDetails.durationMs)}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">API Duration</div>
                                            <div className="text-gray-600">{formatDuration(callDetails.apiDurationMs)}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Processing Duration</div>
                                            <div className="text-gray-600">{formatDuration(callDetails.processingDurationMs)}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Started</div>
                                            <div className="text-gray-600">{formatTimestamp(callDetails.startTime)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Token Usage */}
                                {(callDetails.tokenUsage || responseMetadata?.usage?.nativeUsage) && (
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-1">
                                            <Hash size={12} />
                                            Token Usage
                                        </h4>
                                        {responseMetadata?.usage?.nativeUsage ? (
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="text-center p-2 bg-blue-50 rounded">
                                                    <div className="font-bold text-blue-800">{responseMetadata.usage.nativeUsage.promptTokens || 0}</div>
                                                    <div className="text-blue-600">Input</div>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 rounded">
                                                    <div className="font-bold text-green-800">{responseMetadata.usage.nativeUsage.completionTokens || 0}</div>
                                                    <div className="text-green-600">Output</div>
                                                </div>
                                                <div className="text-center p-2 bg-purple-50 rounded">
                                                    <div className="font-bold text-purple-800">{responseMetadata.usage.nativeUsage.totalTokens || 0}</div>
                                                    <div className="text-purple-600">Total</div>
                                                </div>
                                            </div>
                                        ) : (
                                            formatTokenUsage(callDetails.tokenUsage)
                                        )}
                                    </div>
                                )}

                                {/* Model Information */}
                                <div>
                                    <h4 className="font-semibold mb-2">Model Information</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Provider</div>
                                            <div className="text-gray-600">{callDetails.provider || 'N/A'}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Model</div>
                                            <div className="text-gray-600">{callDetails.modelName || 'N/A'}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Config ID</div>
                                            <div className="text-gray-600">{callDetails.modelConfigurationId}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium">Call ID</div>
                                            <div className="text-gray-600">{callDetails.id}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Information */}
                                {!callDetails.success && callDetails.errorMessage && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            Error Details
                                        </h4>
                                        <div className="bg-red-50 border border-red-200 p-2 rounded text-xs">
                                            <div className="font-medium text-red-800">Error Message:</div>
                                            <div className="text-red-700 mt-1">{callDetails.errorMessage}</div>
                                            {callDetails.errorClass && (
                                                <>
                                                    <div className="font-medium text-red-800 mt-2">Error Class:</div>
                                                    <div className="text-red-700">{callDetails.errorClass}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No call details available</p>
                                <p className="text-xs mt-1">Details will appear after making a model call</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'raw' && (
                    <div className="p-3">
                        {(callDetails || responseMetadata) ? (
                            <div className="space-y-4">
                                {/* Response Metadata Section */}
                                {responseMetadata && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">Response Metadata</h4>
                                        </div>
                                        <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-48">
                                            <pre>{JSON.stringify(responseMetadata, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                                
                                {callDetails && (
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">Raw Call Data</h4>
                                            <button
                                                onClick={() => setShowRawJson(!showRawJson)}
                                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                                            >
                                                {showRawJson ? <EyeOff size={12} /> : <Eye size={12} />}
                                                {showRawJson ? 'Hide' : 'Show'} JSON
                                            </button>
                                        </div>
                                        
                                        {showRawJson && (
                                            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-96">
                                                <pre>{JSON.stringify(callDetails, null, 2)}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Key Raw Fields */}
                                {callDetails && (
                                    <div className="space-y-3">
                                        {callDetails.promptText && (
                                            <div>
                                                <div className="font-medium text-xs mb-1">Prompt Sent:</div>
                                                <div className="bg-blue-50 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                                                    {callDetails.promptText}
                                                </div>
                                            </div>
                                        )}

                                        {callDetails.responseText && (
                                            <div>
                                                <div className="font-medium text-xs mb-1">Raw Response:</div>
                                                <div className="bg-green-50 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                                                    {callDetails.responseText}
                                                </div>
                                            </div>
                                        )}

                                        {callDetails.metadata && (
                                            <div>
                                                <div className="font-medium text-xs mb-1">Metadata:</div>
                                                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                                                    <pre>{JSON.stringify(callDetails.metadata, null, 2)}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No raw data available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}