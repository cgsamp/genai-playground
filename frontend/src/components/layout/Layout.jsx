import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    Book,
    MessageCircle,
    Cpu,
    Settings,
    BarChart2,
    Command,
    Terminal
} from 'lucide-react';

const Layout = () => {
    const location = useLocation();

    // Navigation configuration with icons and labels
    const navigation = [
        { path: '/chat', label: 'Chat', icon: <MessageCircle size={18} /> },
        { path: '/models', label: 'Models', icon: <Cpu size={18} /> },
        { path: '/configs', label: 'Configurations', icon: <Settings size={18} /> },
        { path: '/invoke', label: 'Invoke Model', icon: <Command size={18} /> },
        { path: '/books', label: 'Books', icon: <Book size={18} /> },
        { path: '/graph', label: 'Visualizations', icon: <BarChart2 size={18} /> },
        { path: '/cytoscape', label: 'Relationship Graph', icon: <Terminal size={18} /> }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold text-gray-800">GenAI Dashboard</h1>
                </div>
                <nav className="mt-4 flex-1 overflow-y-auto">
                    {navigation.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t text-xs text-gray-500">
                    GenAI Dashboard v1.0.0
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {navigation.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
