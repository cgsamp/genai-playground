// frontend/app/hooks/useCollections.ts
'use client';

import { useState, useEffect } from 'react';
import { CollectionDefinition, CollectionEntity, getCollectionDefinitions, getCollectionEntities } from '@/app/lib/api/collections';
import { useApiError } from './useApiError';

export function useCollections() {
    const [collections, setCollections] = useState<CollectionDefinition[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<CollectionDefinition | null>(null);
    const [entities, setEntities] = useState<CollectionEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [entitiesLoading, setEntitiesLoading] = useState(false);
    const { error, handleApiError, clearError } = useApiError();

    const fetchCollections = async () => {
        clearError();
        setLoading(true);
        try {
            const data = await getCollectionDefinitions();
            setCollections(data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEntities = async (collectionId: number) => {
        clearError();
        setEntitiesLoading(true);
        try {
            const data = await getCollectionEntities(collectionId);
            setEntities(data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setEntitiesLoading(false);
        }
    };

    const selectCollection = (collection: CollectionDefinition) => {
        setSelectedCollection(collection);
        void fetchEntities(collection.id);
    };

    useEffect(() => {
        void fetchCollections();
    }, []);

    return {
        collections,
        selectedCollection,
        entities,
        loading,
        entitiesLoading,
        error,
        selectCollection,
        refreshCollections: fetchCollections
    };
}
