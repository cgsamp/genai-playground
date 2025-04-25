import React, { useState } from 'react';
import Chat from './Chat';
import BookList from './BookList';

function App() {
  const [showChat, setShowChat] = useState(true);
  const [showBooks, setShowBooks] = useState(true);

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
