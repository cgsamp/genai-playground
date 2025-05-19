import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelConfigCreator = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [modelParameters, setModelParameters] = useState([]);
  const [modelConfig, setModelConfig] = useState({
    temperature: '',
    top_p: '',
    max_tokens: ''
  });
  const [comment, setComment] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedModelId) {
      fetchModelParameters(selectedModelId);
    } else {
      setModelParameters([]);
    }
  }, [selectedModelId]);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      setModels(response.data);
    } catch (err) {
      console.error('Error loading models:', err);
      setStatusMessage('Failed to load models');
      setMessageType('error');
    }
  };

  const fetchModelParameters = async (modelId) => {
    try {
      const response = await axios.get(`/api/model-parameters/model/${modelId}`);
      setModelParameters(response.data);

      // Initialize form with default values
      const defaults = {};
      response.data.forEach(param => {
        if (param.defaultValue) {
          defaults[param.paramName] = param.defaultValue;
        }
      });

      setModelConfig({
        temperature: defaults.temperature || '',
        top_p: defaults.top_p || '',
        max_tokens: defaults.max_tokens || ''
      });
    } catch (err) {
      console.error('Error loading model parameters:', err);
      setModelParameters([]);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setModelConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedModelId) {
      setStatusMessage('Please select a model');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
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

      setStatusMessage('Model configuration saved successfully!');
      setMessageType('success');
      setSelectedModelId('');
      setModelConfig({ temperature: '', top_p: '', max_tokens: '' });
      setComment('');
    } catch (error) {
      console.error('Error saving configuration:', error);
      setStatusMessage('Failed to save configuration');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Find parameter by name for getting guidance info
  const getParameterInfo = (paramName) => {
    return modelParameters.find(param => param.paramName === paramName) || {};
  };

  return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Create Model Configuration</h3>
        </div>
        <div className="card-body">
          {statusMessage && (
              <div className={`mb-4 p-3 rounded-md ${
                  messageType === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {statusMessage}
              </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Model</label>
              <select
                  value={selectedModelId}
                  onChange={e => setSelectedModelId(e.target.value)}
                  className="input"
              >
                <option value="">-- Select a Model --</option>
                {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.modelName} ({model.modelProvider})
                    </option>
                ))}
              </select>
            </div>

            {selectedModelId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                    <div className="flex items-center">
                      <input
                          type="number"
                          step="0.01"
                          name="temperature"
                          value={modelConfig.temperature}
                          onChange={handleConfigChange}
                          className="input max-w-xs"
                      />
                      {getParameterInfo('temperature').description && (
                          <div className="ml-4 text-sm text-gray-500">
                            {getParameterInfo('temperature').description}
                            {getParameterInfo('temperature').minValue && getParameterInfo('temperature').maxValue && (
                                <span className="block mt-1">
                          Range: {getParameterInfo('temperature').minValue} - {getParameterInfo('temperature').maxValue}
                        </span>
                            )}
                          </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top P</label>
                    <div className="flex items-center">
                      <input
                          type="number"
                          step="0.01"
                          name="top_p"
                          value={modelConfig.top_p}
                          onChange={handleConfigChange}
                          className="input max-w-xs"
                      />
                      {getParameterInfo('top_p').description && (
                          <div className="ml-4 text-sm text-gray-500">
                            {getParameterInfo('top_p').description}
                            {getParameterInfo('top_p').minValue && getParameterInfo('top_p').maxValue && (
                                <span className="block mt-1">
                          Range: {getParameterInfo('top_p').minValue} - {getParameterInfo('top_p').maxValue}
                        </span>
                            )}
                          </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                    <div className="flex items-center">
                      <input
                          type="number"
                          name="max_tokens"
                          value={modelConfig.max_tokens}
                          onChange={handleConfigChange}
                          className="input max-w-xs"
                      />
                      {getParameterInfo('max_tokens').description && (
                          <div className="ml-4 text-sm text-gray-500">
                            {getParameterInfo('max_tokens').description}
                            {getParameterInfo('max_tokens').minValue && getParameterInfo('max_tokens').maxValue && (
                                <span className="block mt-1">
                          Range: {getParameterInfo('max_tokens').minValue} - {getParameterInfo('max_tokens').maxValue}
                        </span>
                            )}
                          </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="input"
                        rows="3"
                        placeholder="Add a description for this configuration"
                    ></textarea>
                  </div>

                  <div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="btn btn-primary"
                    >
                      {isLoading ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </>
            )}
          </div>
        </div>
      </div>
  );
};

export default ModelConfigCreator;
