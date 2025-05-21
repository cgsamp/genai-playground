import React from 'react';

export const metadata = {
    title: 'Entity Explorer',
    description: 'Explore all entities in the system',
};

export default function EntityLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full flex flex-col">
            {/* If you have any entity-specific layout elements, add them here */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
