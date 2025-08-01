// components/prompts/PromptForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Prompt, PromptType } from '@/app/types';

interface PromptFormProps {
    promptTypes: PromptType[];
    editingPrompt?: Prompt | null;
    onSubmit: (data: { name: string; text: string; typeId: number }) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
}

export default function PromptForm({
    promptTypes,
    editingPrompt,
    onSubmit,
    onCancel,
    submitting
}: PromptFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        text: '',
        typeId: promptTypes[0]?.id || 1
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (editingPrompt) {
            setFormData({
                name: editingPrompt.name,
                text: editingPrompt.text,
                typeId: editingPrompt.type.id
            });
        } else {
            setFormData({
                name: '',
                text: '',
                typeId: promptTypes[0]?.id || 1
            });
        }
        setErrors({});
    }, [editingPrompt, promptTypes]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Prompt name is required';
        } else if (formData.name.length > 250) {
            newErrors.name = 'Prompt name must be less than 250 characters';
        }

        if (!formData.text.trim()) {
            newErrors.text = 'Prompt text is required';
        }

        if (!formData.typeId) {
            newErrors.typeId = 'Prompt type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'typeId' ? parseInt(value) : value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (err) {
            // Error handling is done by parent component
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Prompt Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter a descriptive name for this prompt"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={submitting}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 mb-1">
                        Prompt Type *
                    </label>
                    <select
                        id="typeId"
                        name="typeId"
                        value={formData.typeId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.typeId ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={submitting}
                    >
                        {promptTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.promptType} - {type.description}
                            </option>
                        ))}
                    </select>
                    {errors.typeId && <p className="text-red-500 text-xs mt-1">{errors.typeId}</p>}
                </div>

                <div>
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                        Prompt Text *
                    </label>
                    <textarea
                        id="text"
                        name="text"
                        value={formData.text}
                        onChange={handleInputChange}
                        placeholder="Enter the prompt text content..."
                        rows={6}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                            errors.text ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={submitting}
                    />
                    {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                        Enter the complete prompt text. Use placeholders like {'{variable}'} if needed.
                    </p>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 
                            (editingPrompt ? 'Updating...' : 'Creating...') : 
                            (editingPrompt ? 'Update Prompt' : 'Create Prompt')
                        }
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {editingPrompt && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Updating a prompt creates a new version and marks the current one as deleted. 
                        This preserves the history for reference.
                    </p>
                </div>
            )}
        </div>
    );
}