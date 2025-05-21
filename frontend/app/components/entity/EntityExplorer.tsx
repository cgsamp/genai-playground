'use client';

import React, { useState, useEffect } from 'react';
import { Book as BookIcon, Users, FileText, Link2 } from 'lucide-react';
import { fetcher } from '@/app/lib/fetcher';
import type {Book, Person, DetailedSummary, Relationship, Attributes} from '@/app/types';

const EntityExplorer = () => {
    const [activeTab, setActiveTab] = useState('books');
    const [books, setBooks] = useState<Book[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [summaries, setSummaries] = useState<DetailedSummary[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [relatedItems, setRelatedItems] = useState({ relationships: [], summaries: [] });


    useEffect(() => {
        void loadTabData(activeTab);
    }, [activeTab]);

    const loadTabData = async (tab: string) => {
        setIsLoading(true);
        setError(null);
        setSelectedEntity(null);
        setRelatedItems({ relationships: [], summaries: [] });

        try {
            let response;
            switch (tab) {
                case 'books':
                    const books = await fetcher<Book[]>('/api/books');
                    setBooks(books);
                    break;
                case 'people':
                    const people = await fetcher<Person[]>('/api/people');
                    setPeople(people);
                    break;
                case 'summaries':
                    const summaries = await fetcher<DetailedSummary[]>('/api/summaries');
                    setSummaries(summaries);
                    break;
                case 'relationships':
                    const relationships = await fetcher<Relationship[]>('/api/relationships/type/all');
                    setRelationships(relationships);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error(`Error loading ${tab}:`, err);
            // @ts-ignore
            setError(`Failed to load ${tab}. ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEntitySelect = async (entity, type) => {
        setSelectedEntity({ ...entity, type });
        setIsLoading(true);
        setRelatedItems({ relationships: [], summaries: [] });

        try {
            // Get relationships for this entity
            const relResponse = await fetch(`/api/relationships/entity?entityType=${type}&entityId=${entity.id}`);

            if (!relResponse.ok) throw new Error('Failed to fetch related items');
            const relationships = await relResponse.json();

            // For books, also get summaries
            let summaries = [];
            if (type === 'book') {
                const sumResponse = await fetch(`/api/summaries?entityType=book&entityId=${entity.id}`);
                if (sumResponse.ok) {
                    summaries = await sumResponse.json();
                }
            }

            setRelatedItems({
                relationships,
                summaries
            });
        } catch (err) {
            console.error('Error loading related data:', err);
            // @ts-ignore
            setError(`Failed to load related data. ${err.message}` as any);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        if (isLoading) {
            return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"></div></div>;
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
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${selectedEntity?.id === book.id && selectedEntity?.type === 'book' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                        onClick={() => handleEntitySelect(book, 'book')}
                    >
                        <h3 className="font-semibold text-lg">{book.name}</h3>
                        <p className="text-gray-700">by {book.authorName || 'Unknown'}</p>
                        <p className="text-gray-600 text-sm">Published: {book.publishYear || 'Unknown'}</p>
                        {book.attributes && (
                            <div className="mt-2 text-sm">
                                {book.attributes["genre"] as string && <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1">{book.attributes["genre"] as string}</span>}
                                {book.attributes["rank"] as string && <span className="inline-block bg-blue-200 rounded-full px-2 py-1 text-xs font-semibold text-blue-700 mr-1">Rank: {book.attributes["rank"] as string}</span>}
                                {book.attributes["pages"] as string && <span className="text-gray-500 text-xs">{book.attributes["pages"] as string} pages</span>}
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
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${selectedEntity?.id === person.id && selectedEntity?.type === 'person' ? 'border-green-500 bg-green-50' : 'hover:border-gray-400'}`}
                        onClick={() => handleEntitySelect(person, 'person')}
                    >
                        <h3 className="font-semibold text-lg">{person.name}</h3>
                        <p className="text-gray-600">{person.occupation || 'Unknown occupation'}</p>
                        {person.email && <p className="text-gray-500 text-sm">{person.email}</p>}
                        {person.birthdate && <p className="text-gray-500 text-sm">Born: {new Date(person.birthdate).toLocaleDateString()}</p>}
                        {person.attributes as Attributes && person.attributes["nationality"] as string  &&
                            <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mt-2">{person.attributes["nationality"] as string}</span>
                        }
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
            <div className="space-y-4 p-4">
                {summaries.map(summary => (
                    <div
                        key={summary.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${selectedEntity?.id === summary.id && selectedEntity?.type === 'summary' ? 'border-yellow-500 bg-yellow-50' : 'hover:border-gray-400'}`}
                        onClick={() => handleEntitySelect(summary, 'summary')}
                    >
                        <div className="flex justify-between">
                            <h3 className="font-semibold">{summary.name}</h3>
                            <span className="text-sm text-gray-500">Entity: {summary.entityType} #{summary.entityId}</span>
                        </div>
                        <div className="mt-2 text-gray-700 text-sm bg-gray-50 p-3 rounded">
                            {summary.content}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                            <span>Source: {summary.source || 'Unknown'}</span>
                            {summary.attributes as Attributes && summary.attributes["quality_score"] as string && (
                                <span className="font-medium">Quality: {summary.attributes["string"] as string}/5</span>
                            )}
                        </div>
                    </div>
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
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${selectedEntity?.id === rel.id && selectedEntity?.type === 'relationship' ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-400'}`}
                        onClick={() => handleEntitySelect(rel, 'relationship')}
                    >
                        <h3 className="font-semibold">{rel.name}</h3>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="bg-gray-200 px-2 py-1 rounded">{rel.sourceType} #{rel.sourceId}</span>
                            <span className="mx-2 font-medium text-purple-600">{rel.relationshipType}</span>
                            <span className="bg-gray-200 px-2 py-1 rounded">{rel.targetType} #{rel.targetId}</span>
                        </div>
                        {rel.attributes && Object.keys(rel.attributes).length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                                {Object.entries(rel.attributes).map(([key, value]) => (
                                    <span key={key} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                    {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
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
        if (!selectedEntity) return null;

        if (isLoading) {
            return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"></div></div>;
        }

        const { relationships = [], summaries = [] } = relatedItems;
        const hasRelationships = relationships.length > 0;
        const hasSummaries = summaries.length > 0;

        return (
            <div className="bg-gray-50 border-t p-4">
                <h3 className="text-lg font-semibold mb-4">
                    Related Items for {selectedEntity.name}
                    <span className="text-sm ml-2 text-gray-500">({selectedEntity.type} #{selectedEntity.id})</span>
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
                      {rel.sourceType} #{rel.sourceId}
                    </span>
                                        <span className="mx-2">→</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {rel.targetType} #{rel.targetId}
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
                                    <div className="font-medium">{summary.name}</div>
                                    <div className="mt-1 text-gray-600">{summary.content.substring(0, 150)}...</div>
                                    <div className="mt-1 text-xs text-gray-500">Source: {summary.source}</div>
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
                        className={`flex items-center px-4 py-3 border-b-2 ${activeTab === 'books' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
                        onClick={() => setActiveTab('books')}
                    >
                        <BookIcon size={18} className="mr-2" /> Books
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 border-b-2 ${activeTab === 'people' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
                        onClick={() => setActiveTab('people')}
                    >
                        <Users size={18} className="mr-2" /> People
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 border-b-2 ${activeTab === 'summaries' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
                        onClick={() => setActiveTab('summaries')}
                    >
                        <FileText size={18} className="mr-2" /> Summaries
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 border-b-2 ${activeTab === 'relationships' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
                        onClick={() => setActiveTab('relationships')}
                    >
                        <Link2 size={18} className="mr-2" /> Relationships
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {renderTabContent()}
            </div>

            {selectedEntity && (
                <div className="border-t">
                    {renderRelatedItems()}
                </div>
            )}
        </div>
    );
};

export default EntityExplorer;
