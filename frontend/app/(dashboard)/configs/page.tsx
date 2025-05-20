// app/(dashboard)/configs/page.tsx
import ModelConfigCreator from '@/app/components/models/ModelConfigCreator';
import ModelConfigurationList from '@/app/components/models/ModelConfigurationList';

export default function ConfigsPage() {
    return (
        <div className="space-y-6">
            <ModelConfigCreator />
            <ModelConfigurationList />
        </div>
    );
}
