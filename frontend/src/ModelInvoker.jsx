import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ModelInvoker() {
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/model-configurations')
      .then(res => setConfigs(res.data))
      .catch(err => {
        console.error('Error loading configurations:', err);
        setError('Failed to load model configurations');
      });
  }, []);

  const handleInvoke = async () => {
    if (!selectedConfigId) {
      setError("Please select a configuration");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/api/batch-summary', {
        modelConfigurationId: selectedConfigId,
        prompt: inputPrompt.trim() || ""
      });
      setResponse(res.data.response || 'Success');
      setError(null);
    } catch (err) {
      console.error('Error calling model:', err);
      
      // Extract detailed error information from the response
      const errorData = err.response?.data;
      
      if (typeof errorData === 'object' && errorData.message) {
        // If response contains structured error with message
        setError(`Error: ${errorData.message}`);
      } else if (typeof errorData === 'string') {
        // If response is a string
        setError(`Error: ${errorData}`);
      } else {
        // Fallback error message
        setError('Failed to invoke model. Please try again later.');
      }
      
      setResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Invoke Model</h2>

      {error && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          border: '1px solid #ef9a9a'
        }}>
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
        <label>Prompt (Optional): </label><br/>
        <textarea
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          placeholder="Enter prompt here (optional)"
          rows={5}
          style={{ width: '400px' }}
        />
      </div>

      <button 
        onClick={handleInvoke} 
        disabled={isLoading || !selectedConfigId}
      >
        {isLoading ? 'Processing...' : 'Send'}
      </button>

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