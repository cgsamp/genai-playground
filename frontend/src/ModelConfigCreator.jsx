// ModelConfigCreator.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ModelConfigCreator() {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [modelConfig, setModelConfig] = useState({
    temperature: '',
    top_p: '',
    max_tokens: ''
  });
  const [comment, setComment] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    axios.get('/api/models')
      .then(res => setModels(res.data))
      .catch(err => {
        console.error('Error loading models:', err);
        setStatusMessage('Failed to load models');
      });
  }, []);

  const handleConfigChange = (e) => {
    setModelConfig(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedModelId) {
      setStatusMessage('Please select a model');
      return;
    }

    try {
      await axios.post('/api/model-configurations', {
        modelId: selectedModelId,
        modelConfig: {
          temperature: parseFloat(modelConfig.temperature),
          top_p: parseFloat(modelConfig.top_p),
          max_tokens: parseInt(modelConfig.max_tokens, 10)
        },
        comment
      });
      setStatusMessage('Model configuration saved!');
      setSelectedModelId('');
      setModelConfig({ temperature: '', top_p: '', max_tokens: '' });
      setComment('');
    } catch (error) {
      console.error('Error saving configuration:', error);
      setStatusMessage('Failed to save configuration');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Create Model Configuration</h2>

      {statusMessage && (
        <div style={{ marginBottom: '1rem', color: 'red' }}>
          {statusMessage}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label>Select Model: </label>
        <select
          value={selectedModelId}
          onChange={e => setSelectedModelId(e.target.value)}
          style={{ marginLeft: '1rem' }}
        >
          <option value="">-- Select --</option>
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.modelName} ({model.modelProvider})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Temperature: </label>
        <input
          type="number"
          step="0.01"
          name="temperature"
          value={modelConfig.temperature}
          onChange={handleConfigChange}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Top P: </label>
        <input
          type="number"
          step="0.01"
          name="top_p"
          value={modelConfig.top_p}
          onChange={handleConfigChange}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Max Tokens: </label>
        <input
          type="number"
          name="max_tokens"
          value={modelConfig.max_tokens}
          onChange={handleConfigChange}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Comment: </label><br/>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          style={{ width: '300px' }}
        />
      </div>

      <button onClick={handleSubmit}>Save Configuration</button>
    </div>
  );
}

export default ModelConfigCreator;
