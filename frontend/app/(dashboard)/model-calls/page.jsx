import ModelCallExplorer from '../../components/models/ModelCallExplorer';

export const metadata = {
    title: 'Model Calls - GenAI Playground',
    description: 'AI Model Call Explorer and Analytics - Debug and analyze model API interactions',
};

export default function ModelCallsPage() {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Model Calls</h1>
                <p className="text-gray-600 mt-2">
                    Explore and analyze AI model API interactions, performance metrics, and debugging information.
                </p>
            </div>
            <ModelCallExplorer />
        </div>
    );
}
