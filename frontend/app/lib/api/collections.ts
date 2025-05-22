// frontend/app/lib/api/collections.ts
import axios from 'axios';
import { Relationship } from '@/app/types';
import { API_URL } from '@/app/config';

export interface CollectionDefinition {
    id: number;
    name: string;
    description?: string;
    curator?: string;
}

export interface CollectionEntity {
    id: number;
    entityType: string;
    entityId: number;
    entityName: string;
    position?: number;
    addedDate?: string;
    // Additional entity details based on type
    details?: any;
}

export interface CollectionWithEntities {
    definition: CollectionDefinition;
    entities: CollectionEntity[];
}

export const getCollectionDefinitions = async (): Promise<CollectionDefinition[]> => {
    const response = await axios.get<Relationship[]>(
        `${API_URL}/api/relationships/type/collection_definition`
    );

    return response.data.map(rel => ({
        id: rel.targetId, // Collection ID
        name: rel.name,
        description: rel.attributes?.description as string,
        curator: rel.attributes?.curator as string,
    }));
};

export const getCollectionEntities = async (collectionId: number): Promise<CollectionEntity[]> => {
    // Get all relationships where target is the collection
    const response = await axios.get<Relationship[]>(
        `${API_URL}/api/relationships/entity?entityType=collection&entityId=${collectionId}`
    );

    // Filter for collection relationships (not collection_definition)
    const collectionRels = response.data.filter(rel =>
        rel.relationshipType === 'collection' &&
        rel.targetId === collectionId
    );

    // Transform to CollectionEntity format
    const entities: CollectionEntity[] = collectionRels.map(rel => ({
        id: rel.id,
        entityType: rel.sourceType,
        entityId: rel.sourceId,
        entityName: rel.name,
        position: rel.attributes?.position as number,
        addedDate: rel.attributes?.added_date as string,
    }));

    // Now fetch the actual entity details for each
    const entitiesWithDetails = await Promise.all(
        entities.map(async (entity) => {
            try {
                let details = null;

                // Fetch entity details based on type
                switch (entity.entityType) {
                    case 'book':
                        const bookResponse = await axios.get(`${API_URL}/api/books/${entity.entityId}`);
                        details = bookResponse.data;
                        entity.entityName = details.name || details.title || entity.entityName;
                        break;
                    case 'person':
                        const personResponse = await axios.get(`${API_URL}/api/people/${entity.entityId}`);
                        details = personResponse.data;
                        entity.entityName = details.name || entity.entityName;
                        break;
                    // Add other entity types as needed
                }

                return {
                    ...entity,
                    details
                };
            } catch (error) {
                console.warn(`Failed to fetch details for ${entity.entityType} ${entity.entityId}:`, error);
                return entity;
            }
        })
    );

    // Sort by position if available
    return entitiesWithDetails.sort((a, b) => {
        if (a.position && b.position) {
            return a.position - b.position;
        }
        return a.entityName.localeCompare(b.entityName);
    });
};

export const getCollectionWithEntities = async (collectionId: number): Promise<CollectionWithEntities> => {
    const [definition, entities] = await Promise.all([
        getCollectionDefinitions().then(defs => defs.find(d => d.id === collectionId)),
        getCollectionEntities(collectionId)
    ]);

    if (!definition) {
        throw new Error(`Collection with ID ${collectionId} not found`);
    }

    return {
        definition,
        entities
    };
};
