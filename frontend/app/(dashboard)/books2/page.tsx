// frontend/app/books2/page.tsx
import Books2Panel from '@/app/components/books/Books2Panel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Books 2',
  description: 'Books 2 panel',
};

export default function Books2Page() {
  return <Books2Panel />;
}
