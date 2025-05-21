import React from 'react';
import EntityExplorer from '../../components/entity/EntityExplorer';

export const metadata = {
    title: 'Entity Explorer',
    description: 'Explore all entities in the system',
};

export default function EntitiesPage() {
    return (
        <div className="h-full">
            <EntityExplorer />
        </div>
    );
}
