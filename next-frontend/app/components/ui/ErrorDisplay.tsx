// components/ui/ErrorDisplay.tsx
interface ErrorDisplayProps {
    error: string;
    onRetry?: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
            <p className="mb-2">{error}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 rounded"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
