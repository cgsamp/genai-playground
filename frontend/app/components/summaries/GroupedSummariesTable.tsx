// frontend/app/components/summaries/GroupedSummariesTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FileText, Settings } from 'lucide-react';

interface DetailedSummaryRecord {
    id: number;
    itemId: number;
    itemName: string;
    itemDetails?: string;
    content: string;
    modelName: string;
    modelProvider: string;
    modelId: number;
    modelConfigurationId: number;
    modelConfig: any;
    configComment: string;
    createdAt: string;
}

interface GroupedSummariesTableProps {
    summaries: DetailedSummaryRecord[];
    loading?: boolean;
}

interface ItemGroup {
    itemId: number;
    itemName: string;
    itemDetails?: string;
    summaries: DetailedSummaryRecord[];
    summaryCount: number;
}

export default function GroupedSummariesTable({ summaries, loading }: GroupedSummariesTableProps) {
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    // Group summaries by item ID
    const groupedData = useMemo(() => {
        const groups = new Map<number, ItemGroup>();

        summaries.forEach(summary => {
            if (!groups.has(summary.itemId)) {
                groups.set(summary.itemId, {
                    itemId: summary.itemId,
                    itemName: summary.itemName,
                    itemDetails: summary.itemDetails,
                    summaries: [],
                    summaryCount: 0
                });
            }

            const group = groups.get(summary.itemId)!;
            group.summaries.push(summary);
            group.summaryCount = group.summaries.length;
        });

        // Sort by item name
        return Array.from(groups.values()).sort((a, b) =>
            a.itemName.localeCompare(b.itemName)
        );
    }, [summaries]);

    const toggleExpanded = (itemId: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const expandAll = () => {
        setExpandedItems(new Set(groupedData.map(group => group.itemId)));
    };

    const collapseAll = () => {
        setExpandedItems(new Set());
    };

    const formatModelInfo = (summary: DetailedSummaryRecord) => {
        return `${summary.modelProvider}/${summary.modelName}`;
    };

    const formatConfigInfo = (summary: DetailedSummaryRecord) => {
        const config = summary.modelConfig;
        const parts = [];

        if (config?.temperature !== undefined) {
            parts.push(`temp=${config.temperature}`);
        }
        if (config?.max_tokens !== undefined) {
            parts.push(`tokens=${config.max_tokens}`);
        }
        if (config?.top_p !== undefined) {
            parts.push(`top_p=${config.top_p}`);
        }

        return parts.length > 0 ? `(${parts.join(', ')})` : '';
    };

    const truncateText = (text: string, maxLength: number = 200) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading summaries...</div>
            </div>
        );
    }

    if (groupedData.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">No summaries found</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    {groupedData.length} items with {summaries.length} total summaries
                </div>
                <div className="space-x-2">
                    <button
                        onClick={expandAll}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={collapseAll}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        Collapse All
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="w-8 px-4 py-3"></th>
                        <th className="text-left px-4 py-3 font-medium text-gray-900">Item</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-900 w-48">Model/Config</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-900">Summary</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-900 w-32">Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groupedData.map((group) => (
                        <React.Fragment key={group.itemId}>
                            {/* Master Row */}
                            <tr
                                className="border-t border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                onClick={() => toggleExpanded(group.itemId)}
                            >
                                <td className="px-4 py-3">
                                    {expandedItems.has(group.itemId) ? (
                                        <ChevronDown size={16} className="text-gray-500" />
                                    ) : (
                                        <ChevronRight size={16} className="text-gray-500" />
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <FileText size={16} className="text-blue-500" />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                Item #{group.itemId}: {group.itemName}
                                            </div>
                                            {group.itemDetails && (
                                                <div className="text-sm text-gray-500">
                                                    {group.itemDetails}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {group.summaryCount} {group.summaryCount === 1 ? 'summary' : 'summaries'}
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    Click to expand summaries
                                </td>
                                <td className="px-4 py-3"></td>
                            </tr>

                            {/* Detail Rows */}
                            {expandedItems.has(group.itemId) && group.summaries.map((summary, index) => (
                                <tr key={summary.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3"></td>
                                    <td className="px-4 py-3 pl-8">
                                        <div className="text-sm text-gray-600">
                                            Summary #{summary.id}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                                                <Settings size={14} className="text-gray-400" />
                                                <span>{formatModelInfo(summary)}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Config #{summary.modelConfigurationId} {formatConfigInfo(summary)}
                                            </div>
                                            {summary.configComment && (
                                                <div className="text-xs text-gray-400 italic">
                                                    {truncateText(summary.configComment, 50)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900 leading-relaxed">
                                            {summary.content}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs text-gray-500">
                                            {new Date(summary.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Stats */}
            <div className="text-xs text-gray-500 border-t pt-4">
                <div className="flex justify-between">
                    <span>
                        {expandedItems.size} of {groupedData.length} items expanded
                    </span>
                    <span>
                        Showing {summaries.length} summaries across {groupedData.length} items
                    </span>
                </div>
            </div>
        </div>
    );
}
