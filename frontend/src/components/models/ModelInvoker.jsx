import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelInvoker = () => {
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    setIsLoadingConfigs(true);
    try {
      const res = await axios.get('/api/model-configurations');
      setConfigs(res.data);
      setError(null);
    } catch (err) {
      console.error('Error loading configurations:', err);
      setError('Failed to load model configurations');
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const handleInvoke = async () => {
    if (!selectedConfigId) {
      setError("Please select a configuration");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse('');

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
    } finally {
      setIsLoading(false);
    }
  };

  const getConfigDisplayName = (config) => {
    const modelName = config.modelName || 'Unknown';
    const comment = config.comment ? `: ${config.comment}` : '';
    return `${modelName}${comment}`;
  };

  return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Invoke Model</h3>
        </div>
        <div className="card-body">
          {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                {error}
              </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Configuration
              </label>

              {isLoadingConfigs ? (
                  <div className="mt-2 text-gray-500">Loading configurations...</div>
              ) : configs.length === 0 ? (
                  <div className="mt-2 text-gray-500">
                    No configurations available. Please create one first.
                  </div>
              ) : (
                  <select
                      value={selectedConfigId}
                      onChange={e => setSelectedConfigId(e.target.value)}
                      className="input"
                      disabled={isLoading}
                  >
                    <option value="">-- Select a Configuration --</option>
                    {configs.map(cfg => (
                        <option key={cfg.id} value={cfg.id}>
                          {getConfigDisplayName(cfg)}
                        </option>
                    ))}
                  </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt (Optional)
              </label>
              <textarea
                  value={inputPrompt}
                  onChange={e => setInputPrompt(e.target.value)}
                  className="input"
                  rows="6"
                  placeholder="Enter prompt here (optional)"
                  disabled={isLoading}
              ></textarea>
            </div>

            <div>
              <button
                  onClick={handleInvoke}
                  disabled={isLoading || !selectedConfigId || configs.length === 0}
                  className={`btn ${
                      isLoading || !selectedConfigId || configs.length === 0
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'btn-primary'
                  }`}
              >
                {isLoading ? 'Processing...' : 'Send'}
              </button>
            </div>

            {response && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">Response:</h3>
                  <div className="p-4 border rounded-md bg-gray-50">
                    <pre className="whitespace-pre-wrap">{response}</pre>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ModelInvoker;
