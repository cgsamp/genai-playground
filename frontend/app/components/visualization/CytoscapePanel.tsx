// components/visualization/CytoscapePanel.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/app/lib/api';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Loading from '@/app/components/ui/Loading';
import cytoscape from 'cytoscape';

interface NodeData {
    id: string;
    label: string;
    type: string;
    details?: any;
}

interface EdgeData {
    id: string;
    source: string;
    target: string;
    label?: string;
}

export default function CytoscapePanel() {
    const cyRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [layout, setLayout] = useState('cose');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [debugMode, setDebugMode] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [graphData, setGraphData] = useState<any>(null);

    // Define the getLayoutConfig function
    const getLayoutConfig = (layoutName: string) => {
        switch(layoutName) {
            case 'grid':
                return {
                    name: 'grid',
                    padding: 30,
                    avoidOverlap: true
                };
            case 'circle':
                return {
                    name: 'circle',
                    padding: 30
                };
            case 'concentric':
                return {
                    name: 'concentric',
                    concentric: function(node: any) {
                        const type = node.data('type');
                        return (type === 'book' || type === 'item') ? 2 : 1;
                    },
                    levelWidth: function() { return 1; },
                    padding: 30
                };
            case 'breadthfirst':
                return {
                    name: 'breadthfirst',
                    directed: true,
                    padding: 30,
                    spacingFactor: 1.5
                };
            case 'cose':
            default:
                return {
                    name: 'cose',
                    padding: 50,
                    componentSpacing: 100,
                    nodeRepulsion: 450000,
                    nodeOverlap: 20,
                    idealEdgeLength: 100,
                    edgeElasticity: 100,
                    nestingFactor: 5,
                    gravity: 80,
                    numIter: 1000,
                    initialTemp: 200,
                    coolingFactor: 0.95,
                    minTemp: 1.0
                };
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.info('Fetching cytoscape graph data');
                
                const response = await api.cytoscape.getCytoscapeData();
                console.info('Successfully fetched cytoscape data:', response);
                console.info('Response elements:', response.elements);
                console.info('Number of nodes:', response.elements?.nodes?.length || 0);
                console.info('Number of edges:', response.elements?.edges?.length || 0);
                
                // Store graph data for debugging
                setGraphData(response);

                // Try to get stats for debugging
                try {
                    const statsResponse = await api.cytoscape.getGraphStats();
                    console.info('Graph stats:', statsResponse);
                    setStats(statsResponse);
                } catch (statsError) {
                    console.warn('Could not fetch graph stats:', statsError);
                }

                // Detailed data structure debugging
                console.info('Full response structure:', JSON.stringify(response, null, 2));
                if (response.elements) {
                    console.info('Elements structure:', response.elements);
                    if (response.elements.nodes) {
                        console.info('First node structure:', response.elements.nodes[0]);
                        console.info('Node data keys:', Object.keys(response.elements.nodes[0] || {}));
                        if (response.elements.nodes[0]?.data) {
                            console.info('First node data:', response.elements.nodes[0].data);
                        }
                    }
                    if (response.elements.edges) {
                        console.info('First edge structure:', response.elements.edges[0]);
                        if (response.elements.edges[0]?.data) {
                            console.info('First edge data:', response.elements.edges[0].data);
                        }
                    }
                }

                if (containerRef.current) {
                    if (!response.elements) {
                        throw new Error('No elements in response');
                    }
                    
                    if (!response.elements.nodes || response.elements.nodes.length === 0) {
                        throw new Error('No nodes in response - the database may not have any items or summaries. Check database initialization.');
                    }
                    // Initialize cytoscape
                    console.info('Initializing cytoscape with elements:', response.elements);
                    console.info('Container element:', containerRef.current);
                    console.info('Container dimensions:', {
                        width: containerRef.current.offsetWidth,
                        height: containerRef.current.offsetHeight,
                        computed: window.getComputedStyle(containerRef.current),
                        offsetParent: containerRef.current.offsetParent
                    });

                    // Validate container has proper dimensions
                    if (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0) {
                        console.warn('Container has zero dimensions! This will prevent cytoscape from rendering.');
                        console.info('Container styles:', {
                            display: window.getComputedStyle(containerRef.current).display,
                            width: window.getComputedStyle(containerRef.current).width,
                            height: window.getComputedStyle(containerRef.current).height,
                            position: window.getComputedStyle(containerRef.current).position
                        });
                    }
                    
                    try {
                        cyRef.current = cytoscape({
                            container: containerRef.current,
                            elements: response.elements,
                            style: [
                                {
                                    selector: 'node',
                                    style: {
                                        'background-color': '#666',
                                        'label': 'data(label)',
                                        'text-valign': 'center',
                                        'color': '#fff',
                                        'text-outline-width': 2,
                                        'text-outline-color': '#666',
                                        'font-size': '12px',
                                        'width': '30px',
                                        'height': '30px'
                                    }
                                },
                                {
                                    selector: 'node.book, node.item',
                                    style: {
                                        'background-color': '#4b7bec',
                                        'shape': 'ellipse',
                                        'text-outline-color': '#4b7bec'
                                    }
                                },
                                {
                                    selector: 'node.summary',
                                    style: {
                                        'background-color': '#26de81',
                                        'shape': 'roundrectangle',
                                        'text-outline-color': '#26de81'
                                    }
                                },
                                {
                                    selector: 'edge',
                                    style: {
                                        'width': 2,
                                        'line-color': '#ccc',
                                        'target-arrow-color': '#ccc',
                                        'target-arrow-shape': 'triangle',
                                        'curve-style': 'bezier',
                                        'label': 'data(label)',
                                        'font-size': '10px',
                                        'color': '#777'
                                    }
                                }
                            ],
                            layout: getLayoutConfig(layout)
                        });
                        
                        console.info('Cytoscape initialized successfully');
                        console.info('Graph elements after init:', cyRef.current.elements().length);
                        console.info('Nodes after init:', cyRef.current.nodes().length);
                        console.info('Edges after init:', cyRef.current.edges().length);
                        
                        // Log the actual nodes and edges
                        cyRef.current.nodes().forEach((node: any, index: number) => {
                            if (index < 3) { // Only log first 3 to avoid spam
                                console.info(`Node ${index}:`, {
                                    id: node.id(),
                                    data: node.data(),
                                    position: node.position(),
                                    visible: node.visible(),
                                    style: node.style()
                                });
                            }
                        });
                        
                        // Check if nodes are visible and positioned
                        const visibleNodes = cyRef.current.nodes().filter((node: any) => node.visible());
                        console.info('Visible nodes count:', visibleNodes.length);
                        
                        // Force a resize and refresh after a short delay
                        setTimeout(() => {
                            if (cyRef.current) {
                                cyRef.current.resize();
                                cyRef.current.fit();
                                console.info('Cytoscape resized and fitted');
                                console.info('Graph zoom:', cyRef.current.zoom());
                                console.info('Graph extent:', cyRef.current.extent());
                            }
                        }, 100);
                        
                    } catch (initError) {
                        console.error('Failed to initialize cytoscape:', initError);
                        throw new Error(`Cytoscape initialization failed: ${(initError as Error).message}`);
                    }

                    // Add event listeners
                    cyRef.current.on('tap', 'node', function(evt: any) {
                        const node = evt.target;
                        setSelectedNode(node.data());
                    });

                    // Add click handler for background to deselect
                    cyRef.current.on('tap', function(evt: any) {
                        if (evt.target === cyRef.current) {
                            setSelectedNode(null);
                        }
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cytoscape data:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                setError(`Failed to load graph data: ${errorMessage}. Please check if the backend API is available.`);
                setLoading(false);
            }
        };

        fetchData();

        // Cleanup function
        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, [layout, refreshTrigger]);

    // Apply a new layout when the layout option changes
    useEffect(() => {
        if (cyRef.current) {
            cyRef.current.layout(getLayoutConfig(layout)).run();
        }
    }, [layout]);

    const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLayout(e.target.value);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const renderNodeDetails = () => {
        if (!selectedNode) return null;

        const details = selectedNode.details || {};

        if (selectedNode.type === 'book' || selectedNode.type === 'item') {
            return (
                <>
                    <h3 className="text-lg font-medium">{selectedNode.label}</h3>
                    <div className="mt-4 space-y-2">
                        <p><span className="font-medium text-gray-700">Type:</span> {details.itemType || selectedNode.type}</p>
                        <p><span className="font-medium text-gray-700">Creator:</span> {details.creator || details.authorName}</p>
                        <p><span className="font-medium text-gray-700">Year:</span> {details.createdYear || details.publishYear}</p>
                        {details.rank && <p><span className="font-medium text-gray-700">Rank:</span> {details.rank}</p>}
                        {details.description && (
                            <div className="mt-3">
                                <p className="font-medium text-gray-700">Description:</p>
                                <p className="mt-1 text-gray-600 text-sm">{details.description}</p>
                            </div>
                        )}
                    </div>
                </>
            );
        } else if (selectedNode.type === 'summary') {
            return (
                <>
                    <h3 className="text-lg font-medium">{selectedNode.label}</h3>
                    <div className="mt-4 space-y-2">
                        <p><span className="font-medium text-gray-700">Type:</span> Summary</p>
                        <p><span className="font-medium text-gray-700">Model:</span> {details.modelName}</p>
                        <p><span className="font-medium text-gray-700">Provider:</span> {details.modelProvider}</p>
                        <p><span className="font-medium text-gray-700">Created:</span> {details.createdAt && new Date(details.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-medium text-gray-700">Summary:</h4>
                        <p className="mt-2 text-gray-600 whitespace-pre-wrap text-sm">{details.content || details.summary}</p>
                    </div>
                </>
            );
        }

        return (
            <>
                <h3 className="text-lg font-medium">{selectedNode.label}</h3>
                <p className="mt-2"><span className="font-medium text-gray-700">Type:</span> {selectedNode.type}</p>
            </>
        );
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <Card>
                <CardBody className="p-8 text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    
                    {stats && (
                        <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                            <h4 className="font-semibold mb-2">Debug Information:</h4>
                            <p>Total Items: {stats.totalItems}</p>
                            <p>Total Summaries: {stats.totalSummaries}</p>
                            <p>Total Relationships: {stats.totalRelationships}</p>
                            {stats.itemTypeCounts && stats.itemTypeCounts.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-medium">Item Types:</p>
                                    {stats.itemTypeCounts.map((typeCount: any) => (
                                        <p key={typeCount.itemType} className="ml-2">
                                            {typeCount.itemType}: {typeCount.count}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="mt-4 space-x-2">
                        <button onClick={handleRefresh} className="btn btn-primary">
                            Try Again
                        </button>
                        <button 
                            onClick={() => setDebugMode(!debugMode)} 
                            className="btn btn-secondary"
                        >
                            {debugMode ? 'Hide' : 'Show'} Debug
                        </button>
                    </div>
                    
                    {debugMode && (
                        <div className="mt-4 p-4 bg-gray-50 rounded text-left text-xs">
                            <h4 className="font-semibold mb-2">Full Error Details:</h4>
                            <pre className="whitespace-pre-wrap">{error}</pre>
                        </div>
                    )}
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items-Summaries Relationship Graph</h3>
                <button
                    onClick={handleRefresh}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </CardHeader>

            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center">
                    <label className="mr-2 text-sm font-medium text-gray-700">Layout:</label>
                    <select
                        value={layout}
                        onChange={handleLayoutChange}
                        className="border rounded px-3 py-1 text-sm"
                    >
                        <option value="cose">Force-Directed (COSE)</option>
                        <option value="grid">Grid</option>
                        <option value="circle">Circle</option>
                        <option value="concentric">Concentric</option>
                        <option value="breadthfirst">Breadth-First</option>
                    </select>

                    <div className="ml-6 flex items-center">
                        <div className="flex items-center mr-4">
                            <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Items</span>
                        </div>
                        <div className="flex items-center mr-4">
                            <div className="h-3 w-3 rounded bg-green-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Summaries</span>
                        </div>
                        <button 
                            onClick={() => setDebugMode(!debugMode)} 
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            {debugMode ? 'Hide Debug' : 'Show Debug'}
                        </button>
                    </div>
                    
                    {stats && (
                        <div className="ml-6 text-xs text-gray-500">
                            {stats.totalItems} items • {stats.totalSummaries} summaries
                        </div>
                    )}
                </div>
            </div>

            <div className="flex">
                <div
                    ref={containerRef}
                    style={{ height: '600px', minHeight: '600px' }}
                    className={`${selectedNode ? 'w-2/3' : 'w-full'} border-r bg-white`}
                />

                {selectedNode && (
                    <div className="w-1/3 p-4 overflow-y-auto" style={{ maxHeight: '600px' }}>
                        {renderNodeDetails()}
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="mt-6 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                        >
                            Close Details
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
                <p>Tip: Click on nodes to view details. Drag nodes to rearrange the graph. Use the mouse wheel to zoom.</p>
                
                {debugMode && (
                    <div className="mt-4 space-y-4">
                        {stats && (
                            <div className="p-4 bg-white rounded border text-sm">
                                <h4 className="font-semibold mb-2">Database Stats:</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <p>Total Items: {stats.totalItems}</p>
                                    <p>Total Summaries: {stats.totalSummaries}</p>
                                    <p>Total Relationships: {stats.totalRelationships}</p>
                                    <p>Total Collections: {stats.totalCollections || 0}</p>
                                </div>
                                {stats.itemTypeCounts && stats.itemTypeCounts.length > 0 && (
                                    <div className="mt-2">
                                        <p className="font-medium">Item Types:</p>
                                        <div className="ml-2 grid grid-cols-2 gap-1">
                                            {stats.itemTypeCounts.map((typeCount: any) => (
                                                <p key={typeCount.itemType} className="text-xs">
                                                    {typeCount.itemType}: {typeCount.count}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {graphData && (
                            <div className="p-4 bg-white rounded border text-sm">
                                <h4 className="font-semibold mb-2">Raw Graph Data:</h4>
                                <div className="max-h-32 overflow-y-auto">
                                    <p className="font-medium">Nodes ({graphData.elements?.nodes?.length || 0}):</p>
                                    {graphData.elements?.nodes?.slice(0, 5).map((node: any, idx: number) => (
                                        <div key={idx} className="ml-2 text-xs">
                                            • {node.data?.label} ({node.data?.type}) - id: {node.data?.id}
                                        </div>
                                    ))}
                                    {graphData.elements?.nodes?.length > 5 && (
                                        <div className="ml-2 text-xs">... and {graphData.elements.nodes.length - 5} more</div>
                                    )}
                                    
                                    <p className="font-medium mt-2">Edges ({graphData.elements?.edges?.length || 0}):</p>
                                    {graphData.elements?.edges?.slice(0, 3).map((edge: any, idx: number) => (
                                        <div key={idx} className="ml-2 text-xs">
                                            • {edge.data?.source} → {edge.data?.target} ({edge.data?.label})
                                        </div>
                                    ))}
                                    {graphData.elements?.edges?.length > 3 && (
                                        <div className="ml-2 text-xs">... and {graphData.elements.edges.length - 3} more</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
