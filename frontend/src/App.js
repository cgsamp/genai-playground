import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import BooksPanel from './components/books/BooksPanel';
import ChatPanel from './components/chat/ChatPanel';
import ModelsPanel from './components/models/ModelsPanel';
import ModelConfigCreator from './components/models/ModelConfigCreator';
import ModelConfigurationList from './components/models/ModelConfigurationList';
import ModelInvoker from './components/models/ModelInvoker';
import CytoscapePanel from './components/visualization/CytoscapePanel';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/chat" />} />
                    <Route path="chat" element={<ChatPanel />} />
                    <Route path="models" element={<ModelsPanel />} />
                    <Route path="configs" element={
                        <div className="space-y-6">
                            <ModelConfigCreator />
                            <ModelConfigurationList />
                        </div>
                    } />
                    <Route path="invoke" element={<ModelInvoker />} />
                    <Route path="books" element={<BooksPanel />} />
                    <Route path="cytoscape" element={<CytoscapePanel />} />
                    <Route path="*" element={<Navigate to="/chat" />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
