// ModelManagement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ModelManagement() {
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);
  const [newModel, setNewModel] = useState({
    modelName: '',
    modelProvider: '',
    modelApiUrl: '',
    comment: ''
  });

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = () => {
    axios.get('/api/models')
      .then(res => {
        console.log("Models data:", res.data);
        setModels(res.data);
      })
      .catch(err => {
        console.error('Error loading models:', err);
        setError('Failed to load models');
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/models', newModel);
      // Reset form
      setNewModel({
        modelName: '',
        modelProvider: '',
        modelApiUrl: '',
        comment: ''
      });
      // Refresh model list
      fetchModels();
    } catch (error) {
      console.error('Error creating model:', error);
      setError('Failed to create model');
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Available Models</h2>
      
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={{ width: '160px' }}>Model Name</th>
            <th style={{ width: '120px' }}>Provider</th>
            <th style={{ width: '200px' }}>API URL</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {models.map(model => (
            <tr key={model.id}>
              <td>{model.modelName}</td>
              <td>{model.modelProvider}</td>
              <td>{model.modelApiUrl}</td>
              <td>{model.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add New Model</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Model Name: </label>
          <input
            type="text"
            name="modelName"
            value={newModel.modelName}
            onChange={handleInputChange}
            style={{ width: '300px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Provider: </label>
          <input
            type="text"
            name="modelProvider"
            value={newModel.modelProvider}
            onChange={handleInputChange}
            style={{ width: '300px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>API URL: </label>
          <input
            type="text"
            name="modelApiUrl"
            value={newModel.modelApiUrl}
            onChange={handleInputChange}
            style={{ width: '300px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Comment: </label>
          <textarea
            name="comment"
            value={newModel.comment}
            onChange={handleInputChange}
            rows={3}
            style={{ width: '300px' }}
          />
        </div>

        <button type="submit">Add Model</button>
      </form>
    </div>
  );
}

export default ModelManagement;