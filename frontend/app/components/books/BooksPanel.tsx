'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/app/config';

// Define types for our data - Updated to match backend Item model
interface Book {
    id: number;
    itemType: string;
    name: string;
    description?: string;
    creator?: string;        // This is the author
    createdYear?: string;    // This is the publish year
    attributes?: {
        rank?: number;
        isbn?: string;
        [key: string]: any;
    };
}

interface Summary {
    id: number;
    itemId: number;         // Updated to match backend
    itemName?: string;      // Updated to match backend
    itemDetails?: string;   // Updated to match backend
    content: string;
    modelName: string;
    modelProvider: string;
    modelId: number;
    modelConfigurationId: number;
    modelConfig: Record<string, any>;
    configComment: string;
    createdAt: string;
}

const BooksPanel: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(new Set());

    useEffect(() => {
        void fetchBooksAndSummaries();
    }, []);

    const fetchBooksAndSummaries = async (): Promise<void> => {
        setIsLoading(true);
        try {
            // Use items API filtered by itemType=book
            const booksResponse = await axios.get<Book[]>(`${API_URL}/api/items?itemType=book`);
            const books = booksResponse.data;
            setBooks(books);

            if (books.length > 0) {
                const bookIds = books.map(book => book.id).join(',');

                // Get summaries for these items
                try {
                    const summariesResponse = await axios.get<Summary[]>(
                        `${API_URL}/api/summaries/items?itemIds=${bookIds}`
                    );
                    setSummaries(summariesResponse.data);
                } catch (summaryError) {
                    console.warn('Failed to fetch summaries for books:', summaryError);
                    setSummaries([]);
                }
            }

            setError(null);
        } catch (err) {
            console.error('Error loading books or summaries:', err);
            setError('Failed to load books data');
        } finally {
            setIsLoading(false);
        }
    };

    const getSummariesForBook = (bookId: number): Summary[] => {
        return summaries.filter(s => s.itemId === bookId);
    };

    const toggleSummaryExpansion = (summaryId: number): void => {
        setExpandedSummaries(prevExpanded => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(summaryId)) {
                newExpanded.delete(summaryId);
            } else {
                newExpanded.add(summaryId);
            }
            return newExpanded;
        });
    };

    const expandAllSummaries = (): void => {
        const allIds = summaries.map(summary => summary.id);
        setExpandedSummaries(new Set(allIds));
    };

    const collapseAllSummaries = (): void => {
        setExpandedSummaries(new Set());
    };

    const isSummaryExpanded = (summaryId: number): boolean => {
        return expandedSummaries.has(summaryId);
    };

    const truncateSummary = (text: string, maxLength: number = 150): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatModelConfig = (config: Record<string, any>): string => {
        if (!config) return '';
        return Object.entries(config)
            .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`)
            .join(', ');
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading books...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center">
                <h3 className="text-lg font-medium">Book List</h3>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-sm">
                        <button
                            onClick={expandAllSummaries}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            Expand All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                            onClick={collapseAllSummaries}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            Collapse All
                        </button>
                    </div>
                    <button onClick={fetchBooksAndSummaries} className="btn btn-secondary text-sm ml-4">
                        Refresh
                    </button>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {books.map((book) => {
                    const bookSummaries = getSummariesForBook(book.id);

                    return (
                        <div key={book.id} className="py-3 px-4 hover:bg-gray-50">
                            <div className="flex">
                                {/* Rank and Book Info Column */}
                                <div className="w-56 flex-none">
                                    <div className="flex">
                                        <div className="w-8 flex-none text-lg font-semibold text-gray-700 mr-2">
                                            {book.attributes?.rank || '#'}
                                        </div>

                                        <div>
                                            <div className="font-semibold text-gray-900">{book.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {book.creator} • {book.createdYear}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summaries Column - taking up all remaining space */}
                                <div className="flex-1 min-w-0">
                                    {bookSummaries.length === 0 ? (
                                        <span className="text-gray-400 italic">No summaries available</span>
                                    ) : (
                                        <div className="space-y-1">
                                            {bookSummaries.map(summary => (
                                                <div key={summary.id} className="border-b border-gray-100 pb-1 last:border-0 last:pb-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="truncate pr-2">
                                                            <span className="font-medium text-xs">{summary.modelName}</span>
                                                            {summary.configComment && (
                                                                <span className="text-xs text-gray-600 ml-1" style={{ fontSize: 'calc(0.75rem - 1px)' }}>
                                  — {summary.configComment}
                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-500 ml-2">
                                [{formatModelConfig(summary.modelConfig)}]
                              </span>
                                                            <span className="text-xs text-gray-400 ml-2">
                                {formatDate(summary.createdAt)}
                              </span>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleSummaryExpansion(summary.id)}
                                                            className="text-xs text-blue-500 hover:text-blue-700 flex-shrink-0"
                                                        >
                                                            {isSummaryExpanded(summary.id) ? 'Collapse' : 'Expand'}
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-gray-700 leading-tight overflow-hidden">
                                                        {isSummaryExpanded(summary.id)
                                                            ? summary.content
                                                            : truncateSummary(summary.content, 120)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BooksPanel;
