import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelsPanel = () => {
    const [models, setModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newModel, setNewModel] = useState({
        modelName: '',
        modelProvider: '',
        modelApiUrl: '',
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/models');
            setModels(response.data);
            setError(null);
        } catch (err) {
            console.error('Error loading models:', err);
            setError('Failed to load models. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewModel(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            await axios.post('/api/models', newModel);
            // Reset form
            setNewModel({
                modelName: '',
                modelProvider: '',
                modelApiUrl: '',
                comment: ''
            });
            // Show success message
            setSuccessMessage('Model added successfully!');
            // Refresh model list
            fetchModels();
        } catch (error) {
            console.error('Error creating model:', error);
            setError('Failed to create model. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Available Models */}
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h3 className="text-lg font-medium">Available Models</h3>
                    <button
                        onClick={fetchModels}
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
                        <p className="mt-2 text-gray-600">Loading models...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-600">
                        <p>{error}</p>
                        <button onClick={fetchModels} className="mt-4 btn btn-primary">
                            Try Again
                        </button>
                    </div>
                ) : models.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        <p>No models available. Add your first model below.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {models.map((model, index) => (
                                <tr key={model.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">{model.modelName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{model.modelProvider}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{model.modelApiUrl}</td>
                                    <td className="px-6 py-4">{model.comment}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add New Model */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-medium">Add New Model</h3>
                </div>
                <div className="card-body">
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                            <input
                                type="text"
                                name="modelName"
                                value={newModel.modelName}
                                onChange={handleInputChange}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                            <input
                                type="text"
                                name="modelProvider"
                                value={newModel.modelProvider}
                                onChange={handleInputChange}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
                            <input
                                type="text"
                                name="modelApiUrl"
                                value={newModel.modelApiUrl}
                                onChange={handleInputChange}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                            <textarea
                                name="comment"
                                value={newModel.comment}
                                onChange={handleInputChange}
                                className="input"
                                rows="3"
                            ></textarea>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Model'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModelsPanel;
