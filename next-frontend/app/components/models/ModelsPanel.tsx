// components/models/ModelsPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';
import { Model } from '@/app/types';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Loading from '@/app/components/ui/Loading';

export default function ModelsPanel() {
    const [models, setModels] = useState<Model[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newModel, setNewModel] = useState<Omit<Model, 'id'>>({
        modelName: '',
        modelProvider: '',
        modelApiUrl: '',
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // @ts-ignore
    useEffect(() => {
        void fetchModels();
    }, []);

    const fetchModels = async () => {
        setIsLoading(true);
        try {
            const response = await api.models.getModels();
            setModels(response);
            setError(null);
        } catch (err) {
            console.error('Error loading models:', err);
            setError('Failed to load models. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewModel(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            await api.models.createModel(newModel);
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
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Available Models</h3>
                    <button
                        onClick={fetchModels}
                        disabled={isLoading}
                        className="btn btn-secondary text-sm"
                    >
                        Refresh
                    </button>
                </CardHeader>

                {isLoading ? (
                    <CardBody>
                        <Loading />
                    </CardBody>
                ) : error ? (
                    <CardBody className="p-8 text-center text-red-600">
                        <p>{error}</p>
                        <button onClick={fetchModels} className="mt-4 btn btn-primary">
                            Try Again
                        </button>
                    </CardBody>
                ) : models.length === 0 ? (
                    <CardBody className="p-8 text-center text-gray-600">
                        <p>No models available. Add your first model below.</p>
                    </CardBody>
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
            </Card>

            {/* Add New Model */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Add New Model</h3>
                </CardHeader>
                <CardBody>
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
                                rows={3}
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
                </CardBody>
            </Card>
        </div>
    );
}
