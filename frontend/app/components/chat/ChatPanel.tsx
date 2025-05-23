// components/chat/ChatPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/lib/api/chat';
import { ChatMessage } from '@/app/types/chat';

export default function ChatPanel() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendChatMessage(input);

            const botMessage: ChatMessage = { role: 'bot', content: response.reply };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error calling API:', error);
            setMessages(prev => [...prev, {
                role: 'error',
                content: 'Error communicating with the service. Please try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await sendMessage();
        }
    };

    return (
        <div className="card flex flex-col h-full">
            <div className="card-header">
                <h3 className="text-lg font-medium">Chat with AI</h3>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-4">
                <div className="flex-1 overflow-y-auto mb-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 my-20">
                            <p className="mb-2">Start a conversation with the AI...</p>
                            <p className="text-sm">Try asking about a book or requesting a creative task</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-4 ${
                                    msg.role === 'user'
                                        ? 'bg-blue-50 rounded-lg p-3 ml-12'
                                        : msg.role === 'error'
                                            ? 'bg-red-50 text-red-700 rounded-lg p-3'
                                            : 'bg-gray-100 rounded-lg p-3 mr-12'
                                }`}
                            >
                                <div className="font-medium mb-1">
                                    {msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : 'AI Assistant'}:
                                </div>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex items-center justify-center space-x-2 mb-4 bg-gray-100 rounded-lg p-3 mr-12">
                            <div className="font-medium">AI Assistant is thinking</div>
                            <div className="flex space-x-1">
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="flex items-end">
          <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg p-3 mr-2 resize-none"
              rows={3}
              disabled={isLoading}
          />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className={`btn ${isLoading || !input.trim() ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} h-12 px-4 rounded text-white`}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
