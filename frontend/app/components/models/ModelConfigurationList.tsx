// components/models/ModelConfigurationList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { ModelConfiguration } from '@/app/types';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Loading from '@/app/components/ui/Loading';

export default function ModelConfigurationList() {
    const [configs, setConfigs] = useState<ModelConfiguration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void fetchConfigurations();
    }, []);

    const fetchConfigurations = async () => {
        setIsLoading(true);
        try {
            const response = await api.configs.getConfigurations();
            setConfigs(response);
            setError(null);
        } catch (err) {
            console.error('Error loading configurations:', err);
            setError('Failed to load model configurations.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format date to local string
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    // Get parameter value from the modelConfig JSON or show default value
    const getParameterValue = (config: ModelConfiguration, paramName: string) => {
        if (!config || !config.modelConfig) return '-';
        return config.modelConfig[paramName] !== undefined
            ? config.modelConfig[paramName]
            : '-';
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <Card>
                <CardBody className="p-8 text-center text-red-600">
                    <p>{error}</p>
                    <button onClick={fetchConfigurations} className="mt-4 btn btn-primary">
                        Try Again
                    </button>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Model Configurations</h3>
                <button
                    onClick={fetchConfigurations}
                    disabled={isLoading}
                    className="btn btn-secondary text-sm"
                >
                    Refresh
                </button>
            </CardHeader>

            {configs.length === 0 ? (
                <CardBody className="p-8 text-center text-gray-600">
                    <p>No model configurations available. Create a new configuration from the "Create Model Config" section.</p>
                </CardBody>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top P</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Tokens</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {configs.map((config, index) => (
                            <tr key={config.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>{config.modelName || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{config.modelProvider}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getParameterValue(config, 'temperature') ?? '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getParameterValue(config, 'top_p') ?? '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getParameterValue(config, 'max_tokens') ?? '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {formatDate(config.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    {config.comment}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
