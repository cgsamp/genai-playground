'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Database, Zap, User, Settings } from 'lucide-react';
import { api } from '@/app/lib/api';
import type { ModelCallRecord, ModelCallStats, ProviderPerformance } from '@/app/lib/api/modelCalls';

// JSON Viewer Component with folding
interface JsonViewerProps {
    data: any;
    title: string;
    defaultExpanded?: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, title, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    if (!data) return null;

    return (
        <div className="border rounded-lg">
            <button
                className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 border-b flex items-center justify-between text-left font-medium"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>{title}</span>
                <span className="text-sm text-gray-500">
                    {isExpanded ? '−' : '+'}
                </span>
            </button>
            {isExpanded && (
                <div className="p-4">
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

// Model Call Detail Component
interface ModelCallDetailProps {
    modelCall: ModelCallRecord;
    onClose: () => void;
}

const ModelCallDetail: React.FC<ModelCallDetailProps> = ({ modelCall, onClose }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">Model Call Details #{modelCall.id}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Overview Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Status</h3>
                            <div className="flex items-center">
                                {modelCall.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                )}
                                <span className={`font-medium ${modelCall.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {modelCall.success ? 'Success' : 'Failed'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Duration</h3>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                                <span className="font-medium">{formatDuration(modelCall.durationMs)}</span>
                            </div>
                            {modelCall.apiDurationMs && (
                                <div className="text-sm text-gray-600 mt-1">
                                    API: {formatDuration(modelCall.apiDurationMs)},
                                    Processing: {formatDuration(modelCall.processingDurationMs)}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Model</h3>
                            <div className="flex items-center">
                                <Database className="w-5 h-5 text-purple-500 mr-2" />
                                <div>
                                    <div className="font-medium">{modelCall.modelName || 'Unknown'}</div>
                                    <div className="text-sm text-gray-600">{modelCall.modelProvider || modelCall.provider}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Execution Details</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>Created:</strong> {formatDate(modelCall.createdAt)}</div>
                                {modelCall.correlationId && <div><strong>Correlation ID:</strong> {modelCall.correlationId}</div>}
                                {modelCall.batchId && <div><strong>Batch ID:</strong> {modelCall.batchId}</div>}
                                {modelCall.requestContext && <div><strong>Context:</strong> {modelCall.requestContext}</div>}
                                {modelCall.userId && <div><strong>User ID:</strong> {modelCall.userId}</div>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Configuration</h3>
                            <div className="space-y-2 text-sm">
                                {modelCall.modelConfigurationId && (
                                    <div><strong>Config ID:</strong> {modelCall.modelConfigurationId}</div>
                                )}
                                <div><strong>Provider:</strong> {modelCall.provider || 'Unknown'}</div>
                                {modelCall.startTime && (
                                    <div><strong>Started:</strong> {formatDate(modelCall.startTime)}</div>
                                )}
                                {modelCall.endTime && (
                                    <div><strong>Ended:</strong> {formatDate(modelCall.endTime)}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error Details */}
                    {!modelCall.success && (
                        <div className="mb-6">
                            <h3 className="font-medium text-red-700 mb-2">Error Details</h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                {modelCall.errorClass && (
                                    <div className="mb-2">
                                        <strong>Error Type:</strong> {modelCall.errorClass}
                                    </div>
                                )}
                                {modelCall.errorMessage && (
                                    <div className="mb-2">
                                        <strong>Message:</strong> {modelCall.errorMessage}
                                    </div>
                                )}
                                {modelCall.errorStacktrace && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-red-700 hover:text-red-800">
                                            View Stack Trace
                                        </summary>
                                        <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                                            {modelCall.errorStacktrace}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    )}

                    {/* JSON Data Sections */}
                    <div className="space-y-4">
                        <JsonViewer
                            data={modelCall.promptText}
                            title="Prompt Text"
                            defaultExpanded={true}
                        />

                        <JsonViewer
                            data={modelCall.promptJson}
                            title="Prompt JSON Structure"
                        />

                        <JsonViewer
                            data={modelCall.responseText}
                            title="Response Text"
                            defaultExpanded={true}
                        />

                        <JsonViewer
                            data={modelCall.responseJson}
                            title="Response JSON Structure"
                        />

                        <JsonViewer
                            data={modelCall.tokenUsage}
                            title="Token Usage"
                        />

                        <JsonViewer
                            data={modelCall.chatOptions}
                            title="Chat Options"
                        />

                        <JsonViewer
                            data={modelCall.modelConfigurationJson}
                            title="Model Configuration"
                        />

                        <JsonViewer
                            data={modelCall.metadata}
                            title="Additional Metadata"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Model Calls Explorer Component
const ModelCallsExplorer: React.FC = () => {
    const [modelCalls, setModelCalls] = useState<ModelCallRecord[]>([]);
    const [stats, setStats] = useState<ModelCallStats | null>(null);
    const [performance, setPerformance] = useState<ProviderPerformance[]>([]);
    const [selectedCall, setSelectedCall] = useState<ModelCallRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadData();
    }, [page, filter]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Load model calls based on filter
            let callsPromise;
            if (filter === 'failed') {
                callsPromise = api.modelCalls.getFailedCalls();
            } else {
                callsPromise = api.modelCalls.getAllModelCalls(page, 20, 'createdAt', 'desc');
            }

            const [callsResult, statsResult, performanceResult] = await Promise.all([
                callsPromise,
                api.modelCalls.getModelCallStats(),
                api.modelCalls.getPerformanceMetrics()
            ]);

            if (Array.isArray(callsResult)) {
                // Failed calls returns array directly
                setModelCalls(callsResult);
                setTotalPages(1);
            } else {
                // Paginated response
                setModelCalls(callsResult.content);
                setTotalPages(callsResult.totalPages);
            }

            setStats(statsResult);
            setPerformance(performanceResult);
        } catch (err) {
            console.error('Error loading model calls:', err);
            setError(err instanceof Error ? err.message : 'Failed to load model calls');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center">
                            <Database className="w-8 h-8 text-blue-500 mr-3" />
                            <div>
                                <div className="text-2xl font-bold">{stats.totalCalls}</div>
                                <div className="text-sm text-gray-600">Total Calls</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                            <div>
                                <div className="text-2xl font-bold">{(stats.successRate * 100).toFixed(1)}%</div>
                                <div className="text-sm text-gray-600">Success Rate</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-purple-500 mr-3" />
                            <div>
                                <div className="text-2xl font-bold">
                                    {stats.averageResponseTime ? formatDuration(stats.averageResponseTime) : 'N/A'}
                                </div>
                                <div className="text-sm text-gray-600">Avg Response</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center">
                            <Zap className="w-8 h-8 text-yellow-500 mr-3" />
                            <div>
                                <div className="text-2xl font-bold">{stats.callsLast24Hours}</div>
                                <div className="text-sm text-gray-600">Last 24h</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Controls */}
            <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        All Calls
                    </button>
                    <button
                        onClick={() => setFilter('success')}
                        className={`px-4 py-2 rounded-lg ${filter === 'success' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    >
                        Successful
                    </button>
                    <button
                        onClick={() => setFilter('failed')}
                        className={`px-4 py-2 rounded-lg ${filter === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Failed
                    </button>
                </div>

                <button
                    onClick={loadData}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Refresh
                </button>
            </div>

            {/* Model Calls Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Context</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {modelCalls.map((call) => (
                            <tr key={call.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        {call.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium">{call.modelName || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{call.modelProvider || call.provider}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm">{formatDuration(call.durationMs)}</div>
                                    {call.apiDurationMs && (
                                        <div className="text-xs text-gray-500">
                                            API: {formatDuration(call.apiDurationMs)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm">{call.requestContext || 'Unknown'}</div>
                                    {call.batchId && (
                                        <div className="text-xs text-gray-500">Batch: {call.batchId}</div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm">{formatDate(call.createdAt)}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => setSelectedCall(call)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page {page + 1} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Provider Performance Table */}
            {performance.length > 0 && (
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 border-b">
                        <h3 className="text-lg font-medium">Provider Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Calls</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg API Time</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {performance.map((perf) => (
                                <tr key={perf.provider} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{perf.provider}</td>
                                    <td className="px-4 py-3">{perf.totalCalls}</td>
                                    <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                perf.successRate > 0.9 ? 'bg-green-100 text-green-800' :
                                                    perf.successRate > 0.7 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                                {(perf.successRate * 100).toFixed(1)}%
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">{formatDuration(perf.averageResponseTime)}</td>
                                    <td className="px-4 py-3">{formatDuration(perf.averageApiTime)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedCall && (
                <ModelCallDetail
                    modelCall={selectedCall}
                    onClose={() => setSelectedCall(null)}
                />
            )}
        </div>
    );
};

export default ModelCallsExplorer;
