import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConfigurationsPanel = () => {
    const [configs, setConfigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConfigurations();
    }, []);

    const fetchConfigurations = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/model-configurations');
            setConfigs(response.data);
            setError(null);
        } catch (err) {
            console.error('Error loading configurations:', err);
            setError('Failed to load model configurations.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format date to local string
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    // Get parameter value from the modelConfig JSON or show default value
    const getParameterValue = (config, paramName) => {
        if (!config || !config.modelConfig) return '-';
        return config.modelConfig[paramName] !== undefined
            ? config.modelConfig[paramName]
            : '-';
    };

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center">
                <h3 className="text-lg font-medium">Model Configurations</h3>
                <button
                    onClick={fetchConfigurations}
                    disabled={isLoading}
                    className="btn btn-secondary text-sm"
                >
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center">
                    <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading configurations...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center text-red-600">
                    <p>{error}</p>
                    <button onClick={fetchConfigurations} className="mt-4 btn btn-primary">
                        Try Again
                    </button>
                </div>
            ) : configs.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                    <p>No model configurations available. Create a new configuration from the "Create Model Config" section.</p>
                </div>
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
                                    {getParameterValue(config, 'temperature')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getParameterValue(config, 'top_p')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getParameterValue(config, 'max_tokens')}
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
        </div>
    );
};

export default ConfigurationsPanel;
