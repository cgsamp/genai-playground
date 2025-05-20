// app/components/chat/MessageList.tsx
import { useRef, useEffect } from 'react';
import { ChatMessage } from '@/app/types/chat';

interface MessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="text-center text-gray-500 my-20">
                <p className="mb-2">Start a conversation with the AI...</p>
                <p className="text-sm">Try asking about a book or requesting a creative task</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
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
            ))}

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
    );
}
