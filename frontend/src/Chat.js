import React, { useState } from 'react';
import axios from 'axios';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post('/api/chat', { content: input });
      const botMessage = { role: 'bot', content: response.data.content };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      setMessages(prev => [...prev, { role: 'error', content: 'Error talking to backend.' }]);
    }

    setInput('');
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '.5rem' }}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        placeholder="Say something..."
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        style={{ width: '80%', padding: '0.5rem' }}
      />
      <button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>
        Send
      </button>
    </div>
  );
}

export default Chat;
