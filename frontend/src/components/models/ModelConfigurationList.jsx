import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ModelConfigurationList() {
  const [configs, setConfigs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/model-configurations')
      .then(res => setConfigs(res.data))
      .catch(err => {
        console.error('Error loading model configurations:', err);
        setError('Failed to load configurations');
      });
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ width: '160px' }}>Model Name</th>
          <th style={{ width: '80px' }}>Temperature</th>
          <th style={{ width: '80px' }}>Top P</th>
          <th style={{ width: '80px' }}>Max Tokens</th>
          <th style={{ width: '200px' }}>Created</th>
          <th>Comment</th>
        </tr>
      </thead>
      <tbody>
        {configs.map(cfg => (
          <tr key={cfg.id}>
            <td>{cfg.modelName || 'Unknown'}</td>
            <td>{cfg.modelConfig?.temperature}</td>
            <td>{cfg.modelConfig?.top_p}</td>
            <td>{cfg.modelConfig?.max_tokens}</td>
            <td>{cfg.createdAt ? new Date(cfg.createdAt).toLocaleString() : ''}</td>
            <td>{cfg.comment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ModelConfigurationList;
