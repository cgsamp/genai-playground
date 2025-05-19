// hooks/useBooks.ts
'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/app/types';
import { api } from '@/app/lib/api';
import { useApiError } from './useApiError';

export function useBooks() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const { error, handleApiError, clearError } = useApiError();

    const fetchBooks = async () => {
        clearError();
        setLoading(true);
        try {
            const data = await api.books.getBooks();
            setBooks(data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return {
        books,
        loading,
        error,
        refreshBooks: fetchBooks
    };
}
