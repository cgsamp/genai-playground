// app/(dashboard)/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
    redirect('/chat');
}
