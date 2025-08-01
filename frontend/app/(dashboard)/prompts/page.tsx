// app/(dashboard)/prompts/page.tsx
import PromptsPanel from '@/app/components/prompts/PromptsPanel';

export default function PromptsPage() {
    return (
        <div className="space-y-6">
            <PromptsPanel />
        </div>
    );
}