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
  const [modelParameters, setModelParameters] = useState([]);
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

  useEffect(() => {
    if (selectedModelId) {
      axios.get(`/api/model-parameters/model/${selectedModelId}`)
        .then(res => setModelParameters(res.data))
        .catch(err => {
          console.error('Error loading model parameters:', err);
          setModelParameters([]);
        });
    } else {
      setModelParameters([]);
    }
  }, [selectedModelId]);

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

  // Find parameter by name for getting guidance info
  const getParameterInfo = (paramName) => {
    return modelParameters.find(param => param.paramName === paramName) || {};
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

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '150px' }}>
          <label>Temperature: </label>
        </div>
        <input
          type="number"
          step="0.01"
          name="temperature"
          value={modelConfig.temperature}
          onChange={handleConfigChange}
          style={{ marginRight: '1rem' }}
        />
        {getParameterInfo('temperature').description && (
          <div style={{ fontSize: '0.9rem', color: '#555', marginLeft: '1rem' }}>
            {getParameterInfo('temperature').description}
            {getParameterInfo('temperature').minValue && getParameterInfo('temperature').maxValue && (
              <span> (Range: {getParameterInfo('temperature').minValue} - {getParameterInfo('temperature').maxValue})</span>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '150px' }}>
          <label>Top P: </label>
        </div>
        <input
          type="number"
          step="0.01"
          name="top_p"
          value={modelConfig.top_p}
          onChange={handleConfigChange}
          style={{ marginRight: '1rem' }}
        />
        {getParameterInfo('top_p').description && (
          <div style={{ fontSize: '0.9rem', color: '#555', marginLeft: '1rem' }}>
            {getParameterInfo('top_p').description}
            {getParameterInfo('top_p').minValue && getParameterInfo('top_p').maxValue && (
              <span> (Range: {getParameterInfo('top_p').minValue} - {getParameterInfo('top_p').maxValue})</span>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '150px' }}>
          <label>Max Tokens: </label>
        </div>
        <input
          type="number"
          name="max_tokens"
          value={modelConfig.max_tokens}
          onChange={handleConfigChange}
          style={{ marginRight: '1rem' }}
        />
        {getParameterInfo('max_tokens').description && (
          <div style={{ fontSize: '0.9rem', color: '#555', marginLeft: '1rem' }}>
            {getParameterInfo('max_tokens').description}
            {getParameterInfo('max_tokens').minValue && getParameterInfo('max_tokens').maxValue && (
              <span> (Range: {getParameterInfo('max_tokens').minValue} - {getParameterInfo('max_tokens').maxValue})</span>
            )}
          </div>
        )}
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