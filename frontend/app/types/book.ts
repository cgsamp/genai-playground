import { ID } from './common';
import { Attributes } from './common';

export interface BookRankSource {
    id: ID;
    orgName: string;
    publishDate: string;
}

export interface Book {
    id: ID;
    rank: number;
    title: string;
    authorName: string;
    publishYear: string;
    source?: BookRankSource;
    attributes: Attributes;
}

export interface BookSummaryRequest {
    modelConfigurationId: ID;
    prompt: string;
}

export interface BookSummaryResponse {
    successCount: number;
    failureCount: number;
}
