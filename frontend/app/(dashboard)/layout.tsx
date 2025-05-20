// app/(dashboard)/layout.tsx
import Navigation from '@/app/components/ui/Navigation';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            <Navigation />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
