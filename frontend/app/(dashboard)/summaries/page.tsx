// frontend/app/(dashboard)/summaries/page.tsx
import EntitySummariesGroupedPage from '@/app/components/summaries/EntitySummariesGroupedPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Entity Summaries',
    description: 'Browse entity summaries organized by item with expandable details',
};

export default function SummariesGroupedPage() {
    return <EntitySummariesGroupedPage />;
}
