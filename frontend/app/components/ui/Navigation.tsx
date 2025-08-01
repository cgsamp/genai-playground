// components/ui/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, MessageCircle, Cpu, Settings, BarChart2, Command, Terminal, Group, Boxes, Database, FileText, MessageSquare } from 'lucide-react';

export default function Navigation() {
    const pathname = usePathname();

    // Navigation configuration with icons and labels
    const navigation = [
        { path: '/chat', label: 'Chat', icon: <MessageCircle size={18} /> },
        { path: '/models', label: 'Models', icon: <Cpu size={18} /> },
        { path: '/configs', label: 'Configurations', icon: <Settings size={18} /> },
        { path: '/prompts', label: 'Prompts', icon: <MessageSquare size={18} /> },
        { path: '/model-calls', label: 'Model Calls', icon: <Database size={18} /> },
        { path: '/invoke', label: 'Invoke Model', icon: <Command size={18} /> },
        { path: '/books', label: 'Books', icon: <Book size={18} /> },
        { path: '/collections', label: 'Collections', icon: <Group size={18} /> },
        { path: '/entity', label: 'Entity', icon: <Boxes size={18} /> },
        { path: '/summaries', label: 'Summaries', icon: <FileText size={18} /> },
        { path: '/cytoscape', label: 'Visualizations', icon: <Terminal size={18} /> },
        { path: '/graph', label: 'Relationship Graph', icon: <BarChart2 size={18} /> }
    ];

    return (
        <div className="w-64 bg-white shadow-md flex flex-col h-screen fixed">
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold text-gray-800">GenAI Dashboard</h1>
            </div>
            <nav className="mt-4 flex-1 overflow-y-auto">
                {navigation.map(item => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center px-4 py-2 ${
                            pathname === item.path
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t text-xs text-gray-500">
                GenAI Dashboard v1.0.0
            </div>
        </div>
    );
}
