import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BooksPanel = () => {
    const [books, setBooks] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBook, setExpandedBook] = useState(null);

    useEffect(() => {
        fetchBooksAndSummaries();
    }, []);

    const fetchBooksAndSummaries = async () => {
        setIsLoading(true);
        try {
            // Fetch books
            const booksResponse = await axios.get('http://localhost:8080/api/books');
            const books = booksResponse.data;
            setBooks(books);

            // Get book IDs
            const bookIds = books.map(book => book.id).join(',');

            // Fetch summaries for these books
            if (books.length > 0) {
                const summariesResponse = await axios.get(`http://localhost:8080/api/summaries?entity=ranked_book&entityIds=${bookIds}`);
                setSummaries(summariesResponse.data);
            }

            setError(null);
        } catch (err) {
            console.error('Error loading books or summaries:', err);
            setError('Failed to load books data');
        } finally {
            setIsLoading(false);
        }
    };

    const getSummariesForBook = (bookId) => {
        return summaries.filter(s => s.entityId === bookId);
    };

    const toggleBookExpansion = (bookId) => {
        if (expandedBook === bookId) {
            setExpandedBook(null);
        } else {
            setExpandedBook(bookId);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="card p-8 text-center">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading books and summaries...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-8 text-center">
                <div className="text-red-600 mb-4">{error}</div>
                <button onClick={fetchBooksAndSummaries} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center">
                <h3 className="text-lg font-medium">Book List</h3>
                <button
                    onClick={fetchBooksAndSummaries}
                    className="btn btn-secondary text-sm"
                >
                    Refresh
                </button>
            </div>

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
                                                                                `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`
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
        </div>
    );
};

export default BooksPanel;
