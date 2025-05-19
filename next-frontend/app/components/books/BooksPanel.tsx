// components/books/BooksPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import { Book, EntitySummary } from '@/app/types';
import { api } from '@/app/lib/api';
import Loading from '@/app/components/ui/Loading';

export default function BooksPanel() {
    const [books, setBooks] = useState<Book[]>([]);
    const [summaries, setSummaries] = useState<EntitySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedBook, setExpandedBook] = useState<number | null>(null);

    useEffect(() => {
        void fetchBooksAndSummaries();
    }, []);

    const fetchBooksAndSummaries = async () => {
        setIsLoading(true);
        try {
            // Fetch books
            const booksData = await api.books.getBooks();
            setBooks(booksData);

            // Get book IDs
            const bookIds = booksData.map(book => book.id);

            // Fetch summaries for these books
            if (booksData.length > 0) {
                const summariesData = await api.books.getBookSummaries(bookIds);
                setSummaries(summariesData);
            }

            setError(null);
        } catch (err) {
            console.error('Error loading books or summaries:', err);
            setError('Failed to load books data');
        } finally {
            setIsLoading(false);
        }
    };

    const getSummariesForBook = (bookId: number) => {
        return summaries.filter(s => s.entityId === bookId);
    };

    const toggleBookExpansion = (bookId: number) => {
        if (expandedBook === bookId) {
            setExpandedBook(null);
        } else {
            setExpandedBook(bookId);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <Card>
                <CardBody className="p-8 text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button onClick={fetchBooksAndSummaries} className="btn btn-primary">
                        Try Again
                    </button>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Book List</h3>
                <button
                    onClick={fetchBooksAndSummaries}
                    className="btn btn-secondary text-sm"
                >
                    Refresh
                </button>
            </CardHeader>

            {books.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                    <p>No books available in the database.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Rank</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Year</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summaries</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {books.map((book) => {
                            const bookSummaries = getSummariesForBook(book.id);
                            const isExpanded = expandedBook === book.id;

                            return (
                                <tr
                                    key={book.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => toggleBookExpansion(book.id)}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-900">{book.rank}</td>
                                    <td className="px-4 py-4 font-medium text-gray-900">{book.title}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{book.authorName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{book.publishYear}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{book.source?.orgName}</td>
                                    <td className="px-4 py-4">
                                        {bookSummaries.length === 0 ? (
                                            <span className="text-gray-500">No summaries available</span>
                                        ) : (
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{bookSummaries.length} Summary/ies</span>
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBookExpansion(book.id);
                                                        }}
                                                    >
                                                        {isExpanded ? 'Collapse' : 'Expand'}
                                                    </button>
                                                </div>

                                                {isExpanded && (
                                                    <div className="mt-3 space-y-4">
                                                        {bookSummaries.map(summary => (
                                                            <div key={summary.id} className="border-t pt-3">
                                                                <div className="flex justify-between">
                                                                    <span className="font-medium">{summary.modelName}</span>
                                                                    <span className="text-xs text-gray-500">
                                      {formatDate(summary.createdAt)}
                                    </span>
                                                                </div>

                                                                {summary.modelConfig && (
                                                                    <div className="text-xs text-gray-600 mt-1">
                                                                        {Object.entries(summary.modelConfig)
                                                                            .map(([key, value]) =>
                                                                                `${key}: ${typeof value === 'number' ? (value as number).toFixed(2) : value}`
                                                                            )
                                                                            .join(', ')}
                                                                    </div>
                                                                )}

                                                                <div className="mt-2 text-gray-700">
                                                                    {summary.summary}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
