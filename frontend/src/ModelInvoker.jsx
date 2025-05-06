import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ModelInvoker() {
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/model-configurations')
      .then(res => setConfigs(res.data))
      .catch(err => {
        console.error('Error loading configurations:', err);
        setError('Failed to load model configurations');
      });
  }, []);

  const handleInvoke = async () => {
    if (!selectedConfigId || !inputPrompt.trim()) {
      setError('Please select a configuration and enter a prompt');
      return;
    }

    try {
      const res = await axios.post('/api/model-call', {
        modelConfigurationId: selectedConfigId,
        prompt: inputPrompt
      });
      setResponse(res.data.response);
      setError(null);
    } catch (err) {
      console.error('Error calling model:', err);
      setError('Failed to invoke model');
      setResponse('');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Invoke Model</h2>

      {error && (
        <div style={{ marginBottom: '1rem', color: 'red' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label>Select Configuration: </label>
        <select
          value={selectedConfigId}
          onChange={e => setSelectedConfigId(e.target.value)}
          style={{ marginLeft: '1rem' }}
        >
          <option value="">-- Select --</option>
          {configs.map(cfg => (
            <option key={cfg.id} value={cfg.id}>
              {cfg.modelName || 'Unknown'} - {cfg.comment || ''}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Prompt: </label><br/>
        <textarea
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          rows={5}
          style={{ width: '400px' }}
        />
      </div>

      <button onClick={handleInvoke}>Send</button>

      {response && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>Response:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default ModelInvoker;
