import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import cytoscape from 'cytoscape';

const CytoscapePanel = () => {
    const cyRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [layout, setLayout] = useState('cose');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/cytoscape/books-summaries');

                if (containerRef.current) {
                    // Initialize cytoscape
                    cyRef.current = cytoscape({
                        container: containerRef.current,
                        elements: response.data.elements,
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
                                    'font-size': '12px'
                                }
                            },
                            {
                                selector: 'node.book',
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

                    // Add event listeners
                    cyRef.current.on('tap', 'node', function(evt) {
                        const node = evt.target;
                        setSelectedNode(node.data());
                    });

                    // Add click handler for background to deselect
                    cyRef.current.on('tap', function(evt) {
                        if (evt.target === cyRef.current) {
                            setSelectedNode(null);
                        }
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cytoscape data:', error);
                setError('Failed to load graph data. Please check if the backend API is available.');
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
    }, [layout]);

    const getLayoutConfig = (layoutName) => {
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
                    concentric: function(node) {
                        return node.data('type') === 'book' ? 2 : 1;
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

    const handleLayoutChange = (e) => {
        setLayout(e.target.value);
    };

    const renderNodeDetails = () => {
        if (!selectedNode) return null;

        const details = selectedNode.details || {};

        if (selectedNode.type === 'book') {
            return (
                <>
                    <h3 className="text-lg font-medium">{selectedNode.label}</h3>
                    <div className="mt-4 space-y-2">
                        <p><span className="font-medium text-gray-700">Type:</span> Book</p>
                        <p><span className="font-medium text-gray-700">Author:</span> {details.authorName}</p>
                        <p><span className="font-medium text-gray-700">Published:</span> {details.publishYear}</p>
                        <p><span className="font-medium text-gray-700">Rank:</span> {details.rank}</p>
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
                        <p className="mt-2 text-gray-600 whitespace-pre-wrap">{details.summary}</p>
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
        return (
            <div className="card p-8 text-center">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading graph data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-8 text-center">
                <div className="text-red-600 mb-4">{error}</div>
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="text-lg font-medium">Book-Summary Relationship Graph</h3>
            </div>

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
                            <span className="text-xs text-gray-600">Books</span>
                        </div>
                        <div className="flex items-center">
                            <div className="h-3 w-3 rounded bg-green-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Summaries</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex">
                <div
                    ref={containerRef}
                    style={{ height: '600px' }}
                    className={`${selectedNode ? 'w-2/3' : 'w-full'} border-r`}
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
            </div>
        </div>
    );
};

export default CytoscapePanel;
