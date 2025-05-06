import React, { useState } from 'react';
import Chat from './Chat';
import BookList from './BookList';
import ModelConfigCreator from './ModelConfigCreator';
import ModelConfigurationList from './ModelConfigurationList';
import ModelInvoker from './ModelInvoker';
import ModelManagement from './ModelManagement';

function App() {
  const [showChat, setShowChat] = useState(true);
  const [showBooks, setShowBooks] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showConfigList, setShowConfigList] = useState(false);
  const [showInvoker, setShowInvoker] = useState(false);
  const [showModelManagement, setShowModelManagement] = useState(false);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>GenAI Dashboard</h1>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setShowChat(prev => !prev)}>
          {showChat ? 'Hide' : 'Show'} Chat
        </button>
        {showChat && (
          <div style={{ marginTop: '1rem' }}>
            <Chat />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setShowModelManagement(prev => !prev)}>
          {showModelManagement ? 'Hide' : 'Show'} Models
        </button>
        {showModelManagement && (
          <div style={{ marginTop: '1rem' }}>
            <ModelManagement />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setShowConfig(prev => !prev)}>
          {showConfig ? 'Hide' : 'Show'} Create Model Config
        </button>
        {showConfig && (
          <div style={{ marginTop: '1rem' }}>
            <ModelConfigCreator />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setShowConfigList(prev => !prev)}>
          {showConfigList ? 'Hide' : 'Show'} Model Configurations
        </button>
        {showConfigList && (
          <div style={{ marginTop: '1rem' }}>
            <ModelConfigurationList />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setShowInvoker(prev => !prev)}>
          {showInvoker ? 'Hide' : 'Show'} Invoke Model
        </button>
        {showInvoker && (
          <div style={{ marginTop: '1rem' }}>
            <ModelInvoker />
          </div>
        )}
      </div>

      <div>
        <button onClick={() => setShowBooks(prev => !prev)}>
          {showBooks ? 'Hide' : 'Show'} Book List
        </button>
        {showBooks && (
          <div style={{ marginTop: '1rem' }}>
            <BookList />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;