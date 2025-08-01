import axios from 'axios';
import { Book, EntitySummary } from '@/app/types';
import { API_URL } from '@/app/config';

export const getBooks = async (): Promise<Book[]> => {
    // Use items API with book type filter
    const response = await axios.get<Book[]>(`${API_URL}/api/items?itemType=book`);
    return response.data;
};

export const getBookSummaries = async (bookIds: number[]): Promise<EntitySummary[]> => {
    const response = await axios.get<EntitySummary[]>(
        `${API_URL}/api/summaries?entity=book&entityIds=${bookIds.join(',')}`
    );
    return response.data;
};
