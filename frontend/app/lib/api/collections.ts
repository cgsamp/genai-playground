// frontend/app/lib/api/collections.ts
import axios from 'axios';
import { Item } from './items';
import { API_URL } from '@/app/config';

export interface CollectionDefinition {
    id: number;
    name: string;
    description?: string;
    curator?: string;
}

export interface CollectionEntity {
    id: number;
    itemId: number;
    itemName: string;
    position?: number;
    addedDate?: string;
    // Item details loaded from the unified Item model
    details?: Item;
}

export interface CollectionWithEntities {
    definition: CollectionDefinition;
    entities: CollectionEntity[];
}

export interface Relationship {
    id: number;
    name: string;
    relationshipType: string;
    sourceItemId: number;
    targetItemId: number;
    attributes?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export const getCollectionDefinitions = async (): Promise<CollectionDefinition[]> => {
    const response = await axios.get<Relationship[]>(
        `${API_URL}/api/relationships/type/collection_definition`
    );

    return response.data.map(rel => ({
        id: rel.targetItemId, // Collection ID is the target in the relationship
        name: rel.name,
        description: rel.attributes?.description as string,
        curator: rel.attributes?.curator as string,
    }));
};

export const getCollectionEntities = async (collectionId: number): Promise<CollectionEntity[]> => {
    // Get all relationships where target is the collection
    const response = await axios.get<Relationship[]>(
        `${API_URL}/api/relationships/collection/${collectionId}`
    );

    // Filter for collection member relationships (not collection_definition)
    const collectionRels = response.data.filter(rel =>
        rel.relationshipType === 'collection' &&
        rel.targetItemId === collectionId
    );

    // Transform to CollectionEntity format
    const entities: CollectionEntity[] = collectionRels.map(rel => ({
        id: rel.id,
        itemId: rel.sourceItemId,
        itemName: rel.name,
        position: rel.attributes?.position as number,
        addedDate: rel.attributes?.added_date as string,
    }));

    // Now fetch the actual item details for each entity
    const entitiesWithDetails = await Promise.all(
        entities.map(async (entity) => {
            try {
                const itemResponse = await axios.get<Item>(`${API_URL}/api/items/${entity.itemId}`);
                const item = itemResponse.data;

                return {
                    ...entity,
                    itemName: item.name || entity.itemName,
                    details: item
                };
            } catch (error) {
                console.warn(`Failed to fetch details for item ${entity.itemId}:`, error);
                return entity;
            }
        })
    );

    // Sort by position if available
    return entitiesWithDetails.sort((a, b) => {
        if (a.position && b.position) {
            return a.position - b.position;
        }
        return a.itemName.localeCompare(b.itemName);
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

export const createCollection = async (
    name: string,
    description?: string,
    curator?: string
): Promise<CollectionDefinition> => {
    // First create the collection as an item
    const collectionItem = await axios.post<Item>(`${API_URL}/api/items`, {
        itemType: 'collection',
        name,
        description,
        attributes: {
            curator,
            itemCount: 0
        }
    });

    // Then create the collection_definition relationship
    const relationshipData = {
        name,
        relationshipType: 'collection_definition',
        sourceItemId: collectionItem.data.id,
        targetItemId: collectionItem.data.id,
        attributes: {
            description,
            curator
        }
    };

    await axios.post(`${API_URL}/api/relationships`, relationshipData);

    return {
        id: collectionItem.data.id,
        name,
        description,
        curator
    };
};

export const addItemToCollection = async (
    collectionId: number,
    itemId: number,
    position?: number
): Promise<void> => {
    const relationshipData = {
        name: `Item ${itemId} in Collection ${collectionId}`,
        relationshipType: 'collection',
        sourceItemId: itemId,
        targetItemId: collectionId,
        attributes: {
            position,
            added_date: new Date().toISOString()
        }
    };

    await axios.post(`${API_URL}/api/relationships`, relationshipData);
};

export const removeItemFromCollection = async (
    collectionId: number,
    itemId: number
): Promise<void> => {
    // Find the relationship to delete
    const relationships = await axios.get<Relationship[]>(
        `${API_URL}/api/relationships/collection/${collectionId}`
    );

    const relationshipToDelete = relationships.data.find(rel =>
        rel.relationshipType === 'collection' &&
        rel.sourceItemId === itemId &&
        rel.targetItemId === collectionId
    );

    if (relationshipToDelete) {
        await axios.delete(`${API_URL}/api/relationships/${relationshipToDelete.id}`);
    }
};
