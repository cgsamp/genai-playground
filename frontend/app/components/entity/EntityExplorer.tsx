'use client';

import React, { useState, useEffect } from 'react';
import { Book as BookIcon, Users, FileText, Link2 } from 'lucide-react';
import { api } from '@/app/lib/api';
import type { Item, ItemSummary, SelectedItem } from '@/app/types';

// Enhanced Summary Card Component
interface SummaryCardProps {
    summary: ItemSummary;
    isSelected?: boolean;
    onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, isSelected, onClick }) => {
    // Format the creation date properly
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Extract model configuration details safely
    const getModelConfigSummary = () => {
        const config = summary.modelConfig || {};
        if (!config || typeof config !== 'object') return 'No configuration';

        const parts = [];
        if (config.temperature !== undefined) parts.push(`temp: ${config.temperature}`);
        if (config.max_tokens !== undefined) parts.push(`max_tokens: ${config.max_tokens}`);
        if (config.top_p !== undefined) parts.push(`top_p: ${config.top_p}`);
        if (config.frequency_penalty !== undefined) parts.push(`freq_penalty: ${config.frequency_penalty}`);
        if (config.presence_penalty !== undefined) parts.push(`presence_penalty: ${config.presence_penalty}`);

        return parts.length > 0 ? parts.join(', ') : 'Default settings';
    };

    return (
        <div
            className={`rounded-lg border p-4 cursor-pointer transition-all ${
                isSelected
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'hover:border-gray-400 bg-white'
            }`}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                    {summary.itemName || `Item #${summary.itemId}`}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Item #{summary.itemId}
                </span>
            </div>

            {/* Item Details */}
            {summary.itemDetails && (
                <div className="mb-3">
                    <p className="text-sm text-gray-600 italic">
                        {summary.itemDetails}
                    </p>
                </div>
            )}

            {/* Summary Content */}
            <div className="mb-4">
                <div className="text-gray-800 text-sm bg-gray-50 p-3 rounded leading-relaxed">
                    {summary.content.length > 300 ? `${summary.content.substring(0, 300)}...` : summary.content}
                </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                {/* Model Information */}
                <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Model</h4>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">{summary.modelName}</span> ({summary.modelProvider})
                        </p>
                        <p className="text-xs text-gray-500">
                            Config ID: {summary.modelConfigurationId}
                        </p>
                        {summary.configComment && (
                            <p className="text-xs text-gray-500 italic">
                                {summary.configComment}
                            </p>
                        )}
                    </div>
                </div>

                {/* Configuration Details */}
                <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Configuration</h4>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-600 font-mono bg-gray-50 p-1 rounded">
                            {getModelConfigSummary()}
                        </p>
                        {summary.modelConfig && (
                            <details className="text-xs">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                    View full config
                                </summary>
                                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(summary.modelConfig, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>

                {/* Timing Information - spans both columns */}
                <div className="md:col-span-2">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Created</h4>
                    <p className="text-xs text-gray-600">
                        {formatDate(summary.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    );
};

const EntityExplorer = () => {
    const [activeTab, setActiveTab] = useState<'books' | 'people' | 'summaries' | 'relationships'>('books');
    const [books, setBooks] = useState<Item[]>([]);
    const [people, setPeople] = useState<Item[]>([]);
    const [summaries, setSummaries] = useState<ItemSummary[]>([]);
    const [relationships, setRelationships] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
    const [relatedItems, setRelatedItems] = useState<{ relationships: any[], summaries: ItemSummary[] }>({
        relationships: [],
        summaries: []
    });

    useEffect(() => {
        void loadTabData(activeTab);
    }, [activeTab]);

    const loadTabData = async (tab: typeof activeTab) => {
        setIsLoading(true);
        setError(null);
        setSelectedItem(null);
        setRelatedItems({ relationships: [], summaries: [] });

        try {
            switch (tab) {
                case 'books':
                    const booksData = await api.items.getItems('book');
                    setBooks(booksData);
                    break;
                case 'people':
                    const peopleData = await api.items.getItems('person');
                    setPeople(peopleData);
                    break;
                case 'summaries':
                    const summariesData = await api.items.getItemSummaries([]);
                    setSummaries(summariesData);
                    break;
                case 'relationships':
                    // Fixed: Now using the proper API method with correct URL
                    const relationshipsData = await api.relationships.getAllRelationships();
                    setRelationships(relationshipsData);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error(`Error loading ${tab}:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to load ${tab}. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemSelect = async (item: Item | ItemSummary, itemType: string) => {
        const itemName = getItemName(item, itemType);
        setSelectedItem({ id: item.id, itemType, name: itemName });
        setIsLoading(true);
        setRelatedItems({ relationships: [], summaries: [] });

        try {
            // Get summaries for this item
            const summariesData = await api.items.getItemSummaries([item.id]);

            // Get relationships for this item - now using the proper API
            const relationshipsData = await api.relationships.getRelationshipsForItem(item.id);

            setRelatedItems({
                relationships: relationshipsData,
                summaries: summariesData
            });
        } catch (err) {
            console.error('Error loading related data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to load related data. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getItemName = (item: Item | ItemSummary, itemType: string): string => {
        if ('name' in item) {
            return item.name;
        }
        if ('itemName' in item) {
            return item.itemName || `Item ${item.itemId}`;
        }
        console.warn('Unexpected item type in getItemName:', item);
        return `${itemType} (unknown)`;
    };

    const renderTabContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            );
        }

        if (error) {
            return <div className="p-4 text-red-600">{error}</div>;
        }

        switch (activeTab) {
            case 'books':
                return renderBooks();
            case 'people':
                return renderPeople();
            case 'summaries':
                return renderSummaries();
            case 'relationships':
                return renderRelationships();
            default:
                return <div>Select a tab</div>;
        }
    };

    const renderBooks = () => {
        if (books.length === 0) {
            return <div className="p-4 text-gray-500">No books found</div>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {books.map(book => (
                    <div
                        key={book.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${
                            selectedItem?.id === book.id && selectedItem?.itemType === 'book'
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:border-gray-400'
                        }`}
                        onClick={() => handleItemSelect(book, 'book')}
                    >
                        <h3 className="font-semibold text-lg">{book.name}</h3>
                        <p className="text-gray-700">by {book.creator || 'Unknown'}</p>
                        <p className="text-gray-600 text-sm">Published: {book.createdYear || 'Unknown'}</p>
                        {book.attributes && (
                            <div className="mt-2 text-sm">
                                {book.attributes["genre"] as string && (
                                    <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1">
                                        {String(book.attributes["genre"])}
                                    </span>
                                )}
                                {book.attributes["rank"] as string && (
                                    <span className="inline-block bg-blue-200 rounded-full px-2 py-1 text-xs font-semibold text-blue-700 mr-1">
                                        Rank: {String(book.attributes["rank"])}
                                    </span>
                                )}
                                {book.attributes["pages"] as string && (
                                    <span className="text-gray-500 text-xs">{String(book.attributes["pages"])} pages</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderPeople = () => {
        if (people.length === 0) {
            return <div className="p-4 text-gray-500">No people found</div>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {people.map(person => (
                    <div
                        key={person.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${
                            selectedItem?.id === person.id && selectedItem?.itemType === 'person'
                                ? 'border-green-500 bg-green-50'
                                : 'hover:border-gray-400'
                        }`}
                        onClick={() => handleItemSelect(person, 'person')}
                    >
                        <h3 className="font-semibold text-lg">{person.name}</h3>
                        <p className="text-gray-600">{person.attributes["occupation"] as string || 'Unknown occupation'}</p>
                        {person.attributes["email"] as string && <p className="text-gray-500 text-sm">{String(person.attributes["email"])}</p>}
                        {person.attributes["birth_date"] as string && (
                            <p className="text-gray-500 text-sm">
                                Born: {new Date(String(person.attributes["birth_date"])).toLocaleDateString()}
                            </p>
                        )}
                        {person.attributes["nationality"] as string && (
                            <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mt-2">
                                {String(person.attributes["nationality"])}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderSummaries = () => {
        if (summaries.length === 0) {
            return <div className="p-4 text-gray-500">No summaries found</div>;
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {summaries.map(summary => (
                    <SummaryCard
                        key={summary.id}
                        summary={summary}
                        isSelected={selectedItem?.id === summary.id && selectedItem?.itemType === 'summary'}
                        onClick={() => handleItemSelect(summary, 'summary')}
                    />
                ))}
            </div>
        );
    };

    const renderRelationships = () => {
        if (relationships.length === 0) {
            return <div className="p-4 text-gray-500">No relationships found</div>;
        }

        return (
            <div className="space-y-4 p-4">
                {relationships.map(rel => (
                    <div
                        key={rel.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${
                            selectedItem?.id === rel.id && selectedItem?.itemType === 'relationship'
                                ? 'border-purple-500 bg-purple-50'
                                : 'hover:border-gray-400'
                        }`}
                        onClick={() => handleItemSelect(rel, 'relationship')}
                    >
                        <h3 className="font-semibold">{rel.name}</h3>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="bg-gray-200 px-2 py-1 rounded">
                                Item #{rel.sourceItemId}
                            </span>
                            <span className="mx-2 font-medium text-purple-600">{rel.relationshipType}</span>
                            <span className="bg-gray-200 px-2 py-1 rounded">
                                Item #{rel.targetItemId}
                            </span>
                        </div>
                        {rel.attributes && Object.keys(rel.attributes).length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                                {Object.entries(rel.attributes).map(([key, value]) => (
                                    <span key={key} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                                        {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderRelatedItems = () => {
        if (!selectedItem) return null;

        if (isLoading) {
            return (
                <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            );
        }

        const { relationships = [], summaries = [] } = relatedItems;
        const hasRelationships = relationships.length > 0;
        const hasSummaries = summaries.length > 0;

        return (
            <div className="bg-gray-50 border-t p-4">
                <h3 className="text-lg font-semibold mb-4">
                    Related Items for {selectedItem.name}
                    <span className="text-sm ml-2 text-gray-500">
                        ({selectedItem.itemType} #{selectedItem.id})
                    </span>
                </h3>

                {!hasRelationships && !hasSummaries && (
                    <p className="text-gray-500">No related items found</p>
                )}

                {hasRelationships && (
                    <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center">
                            <Link2 size={16} className="mr-1" /> Relationships ({relationships.length})
                        </h4>
                        <div className="space-y-2">
                            {relationships.map(rel => (
                                <div key={rel.id} className="border rounded p-3 bg-white text-sm">
                                    <div className="font-medium">{rel.relationshipType}</div>
                                    <div className="flex items-center mt-1">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                            Item #{rel.sourceItemId}
                                        </span>
                                        <span className="mx-2">→</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                            Item #{rel.targetItemId}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasSummaries && (
                    <div>
                        <h4 className="font-medium mb-2 flex items-center">
                            <FileText size={16} className="mr-1" /> Summaries ({summaries.length})
                        </h4>
                        <div className="space-y-2">
                            {summaries.map(summary => (
                                <div key={summary.id} className="border rounded p-3 bg-white text-sm">
                                    <div className="font-medium">
                                        {summary.itemName || `Summary ${summary.id}`}
                                    </div>
                                    <div className="mt-1 text-gray-600">
                                        {summary.content.substring(0, 150)}...
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        Model: {summary.modelName} ({summary.modelProvider})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="card h-full flex flex-col overflow-hidden">
            <div className="card-header border-b">
                <h2 className="text-xl font-semibold">Entity Explorer</h2>
            </div>

            <div className="border-b">
                <div className="flex">
                    <button
                        className={`flex items-center px-4 py-3 border-b-2 ${
                            activeTab === 'books'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('books')}
                    >
                        <BookIcon size={18} className="mr-2" /> Books
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 border-b-2 ${
                            activeTab === 'people'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('people')}
                    >
                        <Users size={18} className="mr-2" /> People
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 border-b-2 ${
                            activeTab === 'summaries'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('summaries')}
                    >
                        <FileText size={18} className="mr-2" /> Summaries
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 border-b-2 ${
                            activeTab === 'relationships'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('relationships')}
                    >
                        <Link2 size={18} className="mr-2" /> Relationships
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {renderTabContent()}
            </div>

            {selectedItem && (
                <div className="border-t">
                    {renderRelatedItems()}
                </div>
            )}
        </div>
    );
};

export default EntityExplorer;
