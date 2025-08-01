// frontend/app/components/summaries/EntitySummariesGroupedPage.tsx
'use client';

import { useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import GroupedSummariesTable from './GroupedSummariesTable';
import { useSummaries } from '@/app/hooks/useSummaries';

export default function EntitySummariesGroupedPage() {
    const { summaries, loading, error, refreshSummaries } = useSummaries();
    const [searchTerm, setSearchTerm] = useState('');

    const handleRefresh = () => {
        console.info('User triggered summaries refresh');
        refreshSummaries();
    };

    // Simple search filter
    const filteredSummaries = summaries.filter(summary => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            summary.itemName?.toLowerCase().includes(searchLower) ||
            summary.content?.toLowerCase().includes(searchLower) ||
            summary.modelName?.toLowerCase().includes(searchLower)
        );
    });

    const handleExport = () => {
        console.info(`Exporting ${filteredSummaries.length} summaries to CSV`);
        
        const csvContent = [
            ['Item ID', 'Item Name', 'Model', 'Summary', 'Created'].join(','),
            ...filteredSummaries.map(s => [
                s.itemId || '',
                `"${s.itemName || ''}"`,
                `"${s.modelProvider || ''}/${s.modelName || ''}"`,
                `"${(s.content || '').replace(/"/g, '""')}"`,
                s.createdAt || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `entity-summaries-${new Date().toISOString().split('T')[0]}.csv`;
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        console.info(`CSV export completed: ${filename}`);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Entity Summaries</h1>
                    <p className="text-gray-600">
                        Browse summaries organized by item with expandable details
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={filteredSummaries.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Simple Search */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="max-w-md">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                    </label>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search items, content, or models..."
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-gray-500">
                            Showing {filteredSummaries.length} of {summaries.length} summaries
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">
                        <strong>Error:</strong> {error.message}
                    </div>
                </div>
            )}

            {/* Main Table */}
            <GroupedSummariesTable
                summaries={filteredSummaries}
                loading={loading}
            />
        </div>
    );
}
