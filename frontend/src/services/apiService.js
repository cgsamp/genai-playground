import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export const api = {
    // Chat
    sendChatMessage: (content) =>
        axios.post(`${BASE_URL}/chat`, { content }),

    // Books
    getBooks: () =>
        axios.get(`${BASE_URL}/api/books`),
    getBookSummaries: (bookIds) =>
        axios.get(`${BASE_URL}/api/summaries?entity=ranked_book&entityIds=${bookIds}`),

    // Models
    getModels: () =>
        axios.get(`${BASE_URL}/api/models`),
    createModel: (modelData) =>
        axios.post(`${BASE_URL}/api/models`, modelData),

    // Model Configurations
    getModelConfigurations: () =>
        axios.get(`${BASE_URL}/api/model-configurations`),
    createModelConfiguration: (configData) =>
        axios.post(`${BASE_URL}/api/model-configurations`, configData),
    getModelParameters: (modelId) =>
        axios.get(`${BASE_URL}/api/model-parameters/model/${modelId}`),

    // Model Invocation
    invokeModel: (modelConfigId, prompt) =>
        axios.post(`${BASE_URL}/api/batch-summary`, {
            modelConfigurationId: modelConfigId,
            prompt: prompt
        }),

    // Cytoscape
    getCytoscapeData: () =>
        axios.get(`${BASE_URL}/api/cytoscape/books-summaries`)
};
