import CollectionsPanel from '@/app/components/collections/CollectionsPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Collections',
    description: 'Collections panel',
};

export default function collectionsPage() {
    return <CollectionsPanel />;
}
