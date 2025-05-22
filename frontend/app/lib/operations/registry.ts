import { FileText, Users, Link2 } from 'lucide-react';
import type { Operation } from '@/app/types/operations';

export const OPERATIONS: Record<string, Operation> = {
    SUMMARIZE_EACH: {
        id: 'summarize_each',
        name: 'Summarize Each',
        description: 'Generate individual summaries for each entity in the collection',
        requiresCollection: true,
    },
    SUMMARIZE_GROUP: {
        id: 'summarize_group',
        name: 'Summarize Group',
        description: 'Generate a single summary for the entire collection',
        requiresCollection: true,
    },
    GENERATE_RELATIONSHIPS: {
        id: 'generate_relationships',
        name: 'Generate Relationships',
        description: 'Analyze relationships between entities in the collection',
        requiresCollection: true,
    },
};

export const getAvailableOperations = (hasCollection: boolean): Operation[] => {
    return Object.values(OPERATIONS).filter(op =>
        !op.requiresCollection || hasCollection
    );
};

export const getOperationById = (id: string): Operation | undefined => {
    return Object.values(OPERATIONS).find(op => op.id === id);
};
