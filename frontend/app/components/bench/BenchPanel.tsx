// components/bench/BenchPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { api } from '@/app/lib/api';
import { ModelConfiguration, Prompt, PromptType } from '@/app/types';
import { ModelCallRecord } from '@/app/lib/api/modelCalls';
import ModelSelector from './ModelSelector';
import PromptSelector from './PromptSelector';
import UserContentInput from './UserContentInput';
import ResponseDisplay from './ResponseDisplay';

export default function BenchPanel() {
    // State for configurations and prompts
    const [modelConfigs, setModelConfigs] = useState<ModelConfiguration[]>([]);
    const [systemPrompts, setSystemPrompts] = useState<Prompt[]>([]);
    const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
    const [promptTypes, setPromptTypes] = useState<PromptType[]>([]);

    // Selected values
    const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
    const [selectedSystemPrompt, setSelectedSystemPrompt] = useState<Prompt | null>(null);
    const [selectedUserPrompt, setSelectedUserPrompt] = useState<Prompt | null>(null);
    const [userContent, setUserContent] = useState('');

    // Call state
    const [isLoading, setIsLoading] = useState(false);
    const [modelResponse, setModelResponse] = useState<string>('');
    const [callDetails, setCallDetails] = useState<ModelCallRecord | null>(null);
    const [responseMetadata, setResponseMetadata] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Loading states
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const generateMockResponse = (prompt: string, configId: number) => {
        // Generate a realistic mock response based on the prompt
        const responses = [
            "Hello! I'm an AI assistant created by OpenAI. I'm here to help you with a wide variety of tasks. Whether you need help with writing, analysis, math, coding, creative projects, or just want to have a conversation, I'm happy to assist. What would you like to work on today?",
            "I understand you'd like me to respond to your prompt. As an AI language model, I can help with many different types of tasks including answering questions, providing explanations, helping with writing and editing, solving problems, and engaging in creative exercises. How can I be most helpful to you?",
            "Thank you for your message! I'm ready to help you with whatever you need. I can assist with research, writing, analysis, problem-solving, creative tasks, and much more. Please let me know what specific task or question you have in mind.",
            "I'm here and ready to help! Based on your input, I can provide information, assist with analysis, help with creative writing, answer questions, or support you with various other tasks. What would you like to focus on?"
        ];
        
        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            response: selectedResponse,
            tokens: {
                prompt_tokens: Math.floor(prompt.length / 4) + Math.floor(Math.random() * 20),
                completion_tokens: Math.floor(selectedResponse.length / 4) + Math.floor(Math.random() * 10),
                total_tokens: 0
            }
        };
    };

    const generateMockCallDetails = (configId: number, prompt: string, response: string): ModelCallRecord => {
        const startTime = new Date(Date.now() - Math.random() * 5000);
        const endTime = new Date(startTime.getTime() + 1000 + Math.random() * 3000);
        const duration = endTime.getTime() - startTime.getTime();
        const apiDuration = Math.floor(duration * (0.7 + Math.random() * 0.2));
        const processingDuration = duration - apiDuration;

        const tokenData = generateMockResponse(prompt, configId);
        tokenData.tokens.total_tokens = tokenData.tokens.prompt_tokens + tokenData.tokens.completion_tokens;

        return {
            id: Math.floor(Math.random() * 10000) + 1000,
            modelConfigurationId: configId,
            provider: 'OpenAI',
            modelName: 'GPT-3.5-Turbo',
            modelProvider: 'OpenAI',
            promptText: prompt,
            responseText: response,
            tokenUsage: tokenData.tokens,
            success: true,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationMs: duration,
            apiDurationMs: apiDuration,
            processingDurationMs: processingDuration,
            createdAt: startTime.toISOString(),
            correlationId: `bench-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            requestContext: 'bench_tool',
            modelConfigurationJson: {
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.95
            },
            chatOptions: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1024,
                topP: 0.95
            },
            metadata: {
                userAgent: 'GenAI-Bench/1.0',
                source: 'bench_interface',
                timestamp: startTime.toISOString()
            }
        };
    };

    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            const [configs, prompts, types] = await Promise.all([
                api.configs.getConfigurations(),
                api.prompts.getPrompts(),
                api.prompts.getPromptTypes()
            ]);

            setModelConfigs(configs);
            setPromptTypes(types);

            // Separate prompts by type
            const systemType = types.find(t => t.promptType === 'SYSTEM');
            const userType = types.find(t => t.promptType === 'USER');

            if (systemType) {
                const sysPrompts = await api.prompts.getPromptsByType(systemType.id);
                setSystemPrompts(sysPrompts);
            }

            if (userType) {
                const usrPrompts = await api.prompts.getPromptsByType(userType.id);
                setUserPrompts(usrPrompts);
            }

            // Auto-select first available options
            if (configs.length > 0) {
                setSelectedConfigId(configs[0].id);
            }

        } catch (err) {
            console.error('Error loading initial data:', err);
            setError('Failed to load initial data');
        } finally {
            setLoadingData(false);
        }
    };

    const buildFinalPrompt = () => {
        let finalPrompt = '';

        // Add system prompt if selected
        if (selectedSystemPrompt) {
            finalPrompt += `<system>\n${selectedSystemPrompt.text}\n</system>\n\n`;
        }

        // Add user prompt if selected
        if (selectedUserPrompt) {
            finalPrompt += selectedUserPrompt.text;
            
            // Replace any placeholders in user prompt with user content
            if (userContent.trim()) {
                // Simple placeholder replacement - look for common patterns
                finalPrompt = finalPrompt.replace(/\{[^}]*\}/g, userContent.trim());
                
                // If no placeholders found, append the content
                if (!finalPrompt.includes(userContent.trim())) {
                    finalPrompt += `\n\n${userContent.trim()}`;
                }
            }
        } else if (userContent.trim()) {
            // If no user prompt template, just use the content directly
            finalPrompt += userContent.trim();
        }

        return finalPrompt.trim();
    };

    const callModel = async () => {
        if (!selectedConfigId) {
            setError('Please select a model configuration');
            return;
        }

        const finalPrompt = buildFinalPrompt();
        if (!finalPrompt) {
            setError('Please provide some content to send to the model');
            return;
        }

        setIsLoading(true);
        setError(null);
        setModelResponse('');
        setCallDetails(null);
        setResponseMetadata(null);

        try {
            // Call the model using the new direct endpoint
            const response = await api.models.directModelCall(selectedConfigId, finalPrompt);
            
            if (response.success) {
                setModelResponse(response.response || '');
                setResponseMetadata(response.responseMetadata || null);
                
                // Create a current call record with the actual data we have
                const currentCallDetails = generateMockCallDetails(selectedConfigId, finalPrompt, response.response || '');
                
                // Use real token data if available from responseMetadata
                if (response.responseMetadata?.usage?.nativeUsage) {
                    const nativeUsage = response.responseMetadata.usage.nativeUsage;
                    currentCallDetails.tokenUsage = {
                        prompt_tokens: nativeUsage.promptTokens || 0,
                        completion_tokens: nativeUsage.completionTokens || 0,
                        total_tokens: nativeUsage.totalTokens || 0
                    };
                }
                
                // Update the call details to reflect this is the current call
                currentCallDetails.promptText = finalPrompt;
                currentCallDetails.responseText = response.response || '';
                currentCallDetails.correlationId = `bench-current-${Date.now()}`;
                currentCallDetails.requestContext = 'bench_interface_current';
                
                // Try to get model information from the selected configuration
                const selectedConfig = modelConfigs.find(config => config.id === selectedConfigId);
                if (selectedConfig) {
                    currentCallDetails.modelName = selectedConfig.modelName || 'Unknown';
                    currentCallDetails.modelProvider = selectedConfig.modelProvider || 'Unknown';
                    currentCallDetails.modelConfigurationJson = selectedConfig.modelConfig;
                    
                    // Update chat options to match the configuration
                    currentCallDetails.chatOptions = {
                        model: selectedConfig.modelName?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'unknown',
                        temperature: selectedConfig.modelConfig?.temperature || 0.7,
                        maxTokens: selectedConfig.modelConfig?.max_tokens || 1024,
                        topP: selectedConfig.modelConfig?.top_p || 0.95
                    };
                }
                
                // Add metadata about the current session
                currentCallDetails.metadata = {
                    ...currentCallDetails.metadata,
                    source: 'bench_interface_current',
                    timestamp: new Date().toISOString(),
                    configComment: selectedConfig?.comment || 'No comment',
                    hasSystemPrompt: !!selectedSystemPrompt,
                    hasUserPrompt: !!selectedUserPrompt,
                    systemPromptTitle: selectedSystemPrompt?.title || null,
                    userPromptTitle: selectedUserPrompt?.title || null
                };
                
                setCallDetails(currentCallDetails);
            } else {
                setError(response.errorMessage || 'Model call failed');
            }

        } catch (err: any) {
            console.error('Error calling model:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to call model';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedSystemPrompt(null);
        setSelectedUserPrompt(null);
        setUserContent('');
        setModelResponse('');
        setCallDetails(null);
        setResponseMetadata(null);
        setError(null);
    };

    if (loadingData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading Bench...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 p-2 text-xs font-mono overflow-hidden">
            <div className="bg-white rounded shadow-sm h-full flex flex-col">
                {/* Header */}
                <div className="p-3 border-b bg-gray-900 text-white rounded-t">
                    <div className="flex items-center justify-between">
                        <h1 className="text-sm font-bold">AI Model Bench</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={resetForm}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
                            >
                                <RotateCcw size={12} />
                                Reset
                            </button>
                            <button
                                onClick={callModel}
                                disabled={isLoading || !selectedConfigId}
                                className={`px-4 py-1 rounded text-xs flex items-center gap-1 ${
                                    isLoading || !selectedConfigId
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                <Play size={12} />
                                {isLoading ? 'Calling...' : 'Call Model'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Section - Selectors */}
                    <div className="p-3 border-b bg-gray-50">
                        <div className="grid grid-cols-3 gap-4">
                            <ModelSelector
                                modelConfigs={modelConfigs}
                                selectedConfigId={selectedConfigId}
                                onSelect={setSelectedConfigId}
                            />
                            <PromptSelector
                                title="System Prompt"
                                prompts={systemPrompts}
                                selectedPrompt={selectedSystemPrompt}
                                onSelect={setSelectedSystemPrompt}
                                placeholder="Select system prompt (optional)"
                            />
                            <PromptSelector
                                title="User Prompt"
                                prompts={userPrompts}
                                selectedPrompt={selectedUserPrompt}
                                onSelect={setSelectedUserPrompt}
                                placeholder="Select user prompt template (optional)"
                            />
                        </div>
                    </div>

                    {/* Middle Section - User Content Input */}
                    <div className="p-3 border-b">
                        <UserContentInput
                            value={userContent}
                            onChange={setUserContent}
                            placeholder="Enter your content here... (will be combined with selected prompts)"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {/* Bottom Section - Response */}
                    <div className="flex-1 overflow-hidden">
                        <ResponseDisplay
                            response={modelResponse}
                            callDetails={callDetails}
                            responseMetadata={responseMetadata}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}