import axios from 'axios';
import { Book, EntitySummary } from '@/app/types';
import { API_URL } from '@/app/config';

export const getBooks = async (): Promise<Book[]> => {
    const response = await axios.get<Book[]>(`${API_URL}/api/books`);
    return response.data;
};

export const getBookSummaries = async (bookIds: number[]): Promise<EntitySummary[]> => {
    const response = await axios.get<EntitySummary[]>(
        `${API_URL}/api/summaries?entity=ranked_book&entityIds=${bookIds.join(',')}`
    );
    return response.data;
};
