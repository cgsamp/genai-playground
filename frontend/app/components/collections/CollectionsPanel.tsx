// frontend/app/components/books/CollectionsPanel.tsx
'use client';

import React from 'react';
import { useCollections } from '@/app/hooks/useCollections';

const CollectionsPanel: React.FC = () => {
    const {
        collections,
        selectedCollection,
        entities,
        loading,
        entitiesLoading,
        error,
        selectCollection
    } = useCollections();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading collections...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-red-800 font-medium">Error Loading Collections</h3>
                <p className="text-red-600 mt-1">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Collections</h1>

                {/* Collection Selection Dropdown */}
                <div className="mb-6">
                    <label htmlFor="collection-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select a Collection
                    </label>
                    <select
                        id="collection-select"
                        value={selectedCollection?.id || ''}
                        onChange={(e) => {
                            const collectionId = parseInt(e.target.value);
                            const collection = collections.find(c => c.id === collectionId);
                            if (collection) {
                                selectCollection(collection);
                            }
                        }}
                        className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Choose a collection...</option>
                        {collections.map((collection) => (
                            <option key={collection.id} value={collection.id}>
                                {collection.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Collection Info */}
                {selectedCollection && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-900">{selectedCollection.name}</h2>
                        {selectedCollection.description && (
                            <p className="text-blue-700 mt-1">{selectedCollection.description}</p>
                        )}
                        {selectedCollection.curator && (
                            <p className="text-blue-600 text-sm mt-2">
                                <span className="font-medium">Curator:</span> {selectedCollection.curator}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Entities in Collection */}
            {selectedCollection && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Entities in {selectedCollection.name}
                    </h2>

                    {entitiesLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-gray-600">Loading entities...</div>
                        </div>
                    ) : entities.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No entities found in this collection.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entities.map((entity) => (
                                <div
                                    key={`${entity.entityType}-${entity.entityId}`}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">
                                                {entity.entityName}
                                            </h3>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {entity.entityType}
                                                </span>
                                                {entity.position && (
                                                    <span className="text-sm text-gray-500">
                                                        Position: {entity.position}
                                                    </span>
                                                )}
                                                {entity.addedDate && (
                                                    <span className="text-sm text-gray-500">
                                                        Added: {new Date(entity.addedDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Entity-specific details */}
                                            {entity.details && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    {entity.entityType === 'book' && (
                                                        <div>
                                                            <span className="font-medium">Author:</span> {entity.details.authorName}
                                                            {entity.details.publishYear && (
                                                                <span> ({entity.details.publishYear})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {entity.entityType === 'person' && (
                                                        <div>
                                                            {entity.details.occupation && (
                                                                <span><span className="font-medium">Occupation:</span> {entity.details.occupation}</span>
                                                            )}
                                                            {entity.details.email && (
                                                                <span className="ml-4"><span className="font-medium">Email:</span> {entity.details.email}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CollectionsPanel;
