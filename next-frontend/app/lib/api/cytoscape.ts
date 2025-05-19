// app/lib/api/cytoscape.ts
import axios from 'axios';
import { API_URL } from '@/app/config';

export const getCytoscapeData = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/api/cytoscape/books-summaries`);
    return response.data;
};
