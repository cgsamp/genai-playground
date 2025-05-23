'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/app/types';
import * as itemsApi from '@/app/lib/api/items';
import { useApiError } from './useApiError';

export function useItems(itemType?: string) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const { error, handleApiError, clearError } = useApiError();

    const fetchItems = async () => {
        clearError();
        setLoading(true);
        try {
            const data = await itemsApi.getItems(itemType);
            setItems(data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchItems();
    }, [itemType]);

    const createItem = async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newItem = await itemsApi.createItem(item);
            setItems(prev => [...prev, newItem]);
            return newItem;
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    const updateItem = async (id: number, updates: Partial<Item>) => {
        try {
            const updatedItem = await itemsApi.updateItem(id, updates);
            setItems(prev => prev.map(item =>
                item.id === id ? updatedItem : item
            ));
            return updatedItem;
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    const deleteItem = async (id: number) => {
        try {
            await itemsApi.deleteItem(id);
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    return {
        items,
        loading,
        error,
        refreshItems: fetchItems,
        createItem,
        updateItem,
        deleteItem
    };
}
