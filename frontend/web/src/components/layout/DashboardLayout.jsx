import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const sidebarNavigation = [
    { name: 'Overview', href: '/dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { name: 'Animals', href: '/admin/animals', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' },
    { name: 'Media Library', href: '/admin/media', icon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' },
    { name: 'Medical Records', href: '/admin/medical', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
];

export default function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-desert-sand/30">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-saddle-brown/10 bg-white">
                <div className="flex h-20 flex-col justify-center px-6 border-b border-saddle-brown/10">
                    <span className="font-serif text-xl font-bold text-saddle-brown">
                        DD Cattle Co.
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-sage">
                        Management
                    </span>
                </div>

                <nav className="flex flex-col gap-1 px-4 py-6">
                    {sidebarNavigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive 
                                    ? 'bg-saddle-brown text-desert-sand' 
                                    : 'text-charcoal/70 hover:bg-sage/10 hover:text-saddle-brown'
                                }`}
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-20 border-b border-saddle-brown/10 bg-white/50 backdrop-blur-sm flex items-center px-8 sticky top-0 z-10">
                    <h1 className="text-2xl font-serif font-bold text-charcoal capitalize">
                        {location.pathname.split('/').pop() || 'Overview'}
                    </h1>
                </div>
                <div className="p-8 max-w-5xl mx-auto">
                    <Outlet /> {/* Renders the active dashboard page */}
                </div>
            </main>
        </div>
    );
}