// components/bench/BenchPanel.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, GripHorizontal } from 'lucide-react';
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

    // Resize states
    const [selectorHeight, setSelectorHeight] = useState(200);
    const [inputHeight, setInputHeight] = useState(120);
    const [adjustmentHeight, setAdjustmentHeight] = useState(300);
    const [isDragging, setIsDragging] = useState<'selectors' | 'input' | 'adjustment' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Resize handlers
    const handleMouseDown = (section: 'selectors' | 'input' | 'adjustment') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(section);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const relativeY = e.clientY - containerRect.top;
            const headerHeight = 60; // Header height
            
            if (isDragging === 'selectors') {
                const newHeight = Math.max(120, Math.min(500, relativeY - headerHeight));
                setSelectorHeight(newHeight);
            } else if (isDragging === 'input') {
                const newHeight = Math.max(60, Math.min(250, relativeY - headerHeight - selectorHeight - 8));
                setInputHeight(newHeight);
            } else if (isDragging === 'adjustment') {
                const availableHeight = containerRect.height - headerHeight - selectorHeight - inputHeight - 24; // 24px for resize handles
                const newHeight = Math.max(100, Math.min(availableHeight - 100, relativeY - headerHeight - selectorHeight - inputHeight - 16));
                setAdjustmentHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, selectorHeight, inputHeight, adjustmentHeight]);

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
        <div className="h-screen bg-gray-50 p-1 text-[10px] font-mono overflow-hidden leading-tight">
            <div className="bg-white rounded shadow-sm h-full flex flex-col" ref={containerRef}>
                {/* Header */}
                <div className="p-2 border-b bg-gray-900 text-white rounded-t flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h1 className="text-[11px] font-bold">AI Model Bench</h1>
                        <div className="flex gap-1">
                            <button
                                onClick={resetForm}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] flex items-center gap-1"
                            >
                                <RotateCcw size={10} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Section - Selectors (Resizable) */}
                    <div 
                        className="p-2 border-b bg-gray-50 flex-shrink-0 overflow-auto"
                        style={{ height: `${selectorHeight}px` }}
                    >
                        <div className="grid grid-cols-3 gap-2 h-full">
                            <ModelSelector
                                modelConfigs={modelConfigs}
                                selectedConfigId={selectedConfigId}
                                onSelect={setSelectedConfigId}
                                availableHeight={selectorHeight - 16}
                            />
                            <PromptSelector
                                title="System Prompt"
                                prompts={systemPrompts}
                                selectedPrompt={selectedSystemPrompt}
                                onSelect={setSelectedSystemPrompt}
                                placeholder="Select system prompt (optional)"
                                availableHeight={selectorHeight - 16}
                            />
                            <PromptSelector
                                title="User Prompt"
                                prompts={userPrompts}
                                selectedPrompt={selectedUserPrompt}
                                onSelect={setSelectedUserPrompt}
                                placeholder="Select user prompt template (optional)"
                                availableHeight={selectorHeight - 16}
                            />
                        </div>
                    </div>

                    {/* Resize Handle for Selectors */}
                    <div 
                        className={`flex items-center justify-center bg-gray-200 border-b cursor-row-resize hover:bg-gray-300 transition-colors ${
                            isDragging === 'selectors' ? 'bg-blue-300' : ''
                        }`}
                        style={{ height: '8px' }}
                        onMouseDown={handleMouseDown('selectors')}
                    >
                        <GripHorizontal size={12} className="text-gray-500" />
                    </div>

                    {/* Middle Section - User Content Input (Resizable) */}
                    <div 
                        className="p-2 border-b flex-shrink-0"
                        style={{ height: `${inputHeight}px` }}
                    >
                        <UserContentInput
                            value={userContent}
                            onChange={setUserContent}
                            placeholder="Enter your content here... (will be combined with selected prompts)"
                            disabled={isLoading}
                            availableHeight={inputHeight - 32}
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                onClick={callModel}
                                disabled={isLoading || !selectedConfigId}
                                className={`px-3 py-1 rounded text-[10px] flex items-center gap-1 ${
                                    isLoading || !selectedConfigId
                                        ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                <Play size={10} />
                                {isLoading ? 'Calling...' : 'Call Model'}
                            </button>
                        </div>
                    </div>

                    {/* Resize Handle for Input */}
                    <div 
                        className={`flex items-center justify-center bg-gray-200 border-b cursor-row-resize hover:bg-gray-300 transition-colors ${
                            isDragging === 'input' ? 'bg-blue-300' : ''
                        }`}
                        style={{ height: '8px' }}
                        onMouseDown={handleMouseDown('input')}
                    >
                        <GripHorizontal size={12} className="text-gray-500" />
                    </div>

                    {/* Adjustment Section (Highly Expandable) */}
                    <div 
                        className="p-2 border-b bg-gray-50 flex-shrink-0 overflow-auto"
                        style={{ height: `${adjustmentHeight}px` }}
                    >
                        <div className="h-full">
                            <div className="text-[10px] font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <GripHorizontal size={10} className="rotate-90" />
                                Model Adjustments & Parameters
                            </div>
                            <div className="grid grid-cols-2 gap-2 h-full">
                                {/* Left Column - Parameter Adjustments */}
                                <div className="space-y-2 overflow-auto">
                                    <div className="text-[9px] font-medium text-gray-600 mb-1">Configuration Parameters</div>
                                    
                                    {/* Temperature */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Temperature: 0.7</label>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="2" 
                                            step="0.1" 
                                            defaultValue="0.7"
                                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[7px] text-gray-400">
                                            <span>Conservative</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>

                                    {/* Max Tokens */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Max Tokens: 1024</label>
                                        <input 
                                            type="range" 
                                            min="50" 
                                            max="4000" 
                                            step="50" 
                                            defaultValue="1024"
                                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[7px] text-gray-400">
                                            <span>50</span>
                                            <span>4000</span>
                                        </div>
                                    </div>

                                    {/* Top P */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Top P: 0.95</label>
                                        <input 
                                            type="range" 
                                            min="0.1" 
                                            max="1" 
                                            step="0.05" 
                                            defaultValue="0.95"
                                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[7px] text-gray-400">
                                            <span>Focused</span>
                                            <span>Diverse</span>
                                        </div>
                                    </div>

                                    {/* Frequency Penalty */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Frequency Penalty: 0.0</label>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="2" 
                                            step="0.1" 
                                            defaultValue="0"
                                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[7px] text-gray-400">
                                            <span>Repetitive</span>
                                            <span>Varied</span>
                                        </div>
                                    </div>

                                    {/* Presence Penalty */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Presence Penalty: 0.0</label>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="2" 
                                            step="0.1" 
                                            defaultValue="0"
                                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[7px] text-gray-400">
                                            <span>Stay on topic</span>
                                            <span>Explore topics</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Quick Presets & Advanced */}
                                <div className="space-y-2 overflow-auto">
                                    <div className="text-[9px] font-medium text-gray-600 mb-1">Quick Presets</div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <button className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-[8px] text-blue-800">
                                            Creative
                                        </button>
                                        <button className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-[8px] text-green-800">
                                            Balanced
                                        </button>
                                        <button className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-[8px] text-purple-800">
                                            Precise
                                        </button>
                                        <button className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-[8px] text-yellow-800">
                                            Factual
                                        </button>
                                    </div>

                                    <div className="text-[9px] font-medium text-gray-600 mt-3 mb-1">Advanced Options</div>
                                    
                                    {/* Stop Sequences */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Stop Sequences</label>
                                        <input 
                                            type="text" 
                                            placeholder="\\n\\n, \\n---\\n"
                                            className="w-full px-1 py-1 text-[8px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Model Selection Override */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Model Override</label>
                                        <select className="w-full px-1 py-1 text-[8px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                                            <option value="">Use Config Default</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                            <option value="gpt-4">GPT-4</option>
                                            <option value="gpt-4o">GPT-4o</option>
                                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                                        </select>
                                    </div>

                                    {/* Seed */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Seed (Reproducibility)</label>
                                        <input 
                                            type="number" 
                                            placeholder="12345"
                                            className="w-full px-1 py-1 text-[8px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Response Format */}
                                    <div className="space-y-1">
                                        <label className="block text-[8px] text-gray-600">Response Format</label>
                                        <select className="w-full px-1 py-1 text-[8px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                                            <option value="text">Text</option>
                                            <option value="json_object">JSON Object</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resize Handle for Adjustments */}
                    <div 
                        className={`flex items-center justify-center bg-gray-200 border-b cursor-row-resize hover:bg-gray-300 transition-colors ${
                            isDragging === 'adjustment' ? 'bg-blue-300' : ''
                        }`}
                        style={{ height: '8px' }}
                        onMouseDown={handleMouseDown('adjustment')}
                    >
                        <GripHorizontal size={12} className="text-gray-500" />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-2 bg-red-50 border border-red-200 text-red-800 text-[10px] flex-shrink-0">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {/* Bottom Section - Response (Takes remaining space) */}
                    <div className="flex-1 overflow-hidden">
                        <ResponseDisplay
                            response={modelResponse}
                            callDetails={callDetails}
                            responseMetadata={responseMetadata}
                            isLoading={isLoading}
                            selectedConfig={modelConfigs.find(config => config.id === selectedConfigId) || null}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}