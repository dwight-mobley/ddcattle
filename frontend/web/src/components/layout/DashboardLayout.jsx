import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const sidebarNavigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { name: 'Animals', href: '/admin/animals', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' },
    { name: 'Reminders', href: '/admin/reminders', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' },
    { name: 'Media Library', href: '/admin/media', icon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' },
    { name: 'Medical Records', href: '/admin/medical', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
    { name: 'Rides', href: '/admin/rides', icon: 'M3 13h18v2H3zM5 5h14v2H5zM5 19h14v2H5z' },
    { name: 'Training', href: '/admin/training', icon: 'M9 16.2l-3.5-3.5L4.1 14.1 9 19l12-12-1.4-1.4z' },
    { name: 'Settings', href: '/admin/settings', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' }
];

export default function DashboardLayout() {
    const location = useLocation();
  
    return (
        <div className="flex min-h-dvh flex-col md:h-screen md:flex-row bg-desert-sand/30">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-saddle-brown/10 bg-white">
                <div className="flex h-16 md:h-20 flex-col justify-center px-6 border-b border-saddle-brown/10">
                    <span className="font-serif text-xl font-bold text-saddle-brown">
                        DD Cattle Co.
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-sage">
                        Management
                    </span>
                </div>

                <nav className="grid grid-cols-2 gap-2 px-3 py-3 md:flex md:flex-col md:gap-1 md:px-4 md:py-6">
                    {sidebarNavigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex min-h-11 min-w-0 items-center gap-2 md:gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive 
                                    ? 'bg-saddle-brown text-desert-sand' 
                                    : 'text-charcoal/70 hover:bg-sage/10 hover:text-saddle-brown'
                                }`}
                            >
                                <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
                                    <path d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="px-4 pb-4"><Link to="/" className="flex min-h-11 items-center justify-center rounded-lg border border-sage/30 px-3 py-2 text-sm font-semibold text-saddle-brown hover:bg-sage/10">View public site</Link></div>
            </aside>

            {/* Main Content Area */}
            <main className="min-w-0 flex-1 md:overflow-y-auto">
                <div className="min-h-16 md:h-20 border-b border-saddle-brown/10 bg-white/50 backdrop-blur-sm flex items-center px-4 md:px-8 sticky top-0 z-10">
                    <h1 className="min-w-0 break-words text-xl md:text-2xl font-serif font-bold text-charcoal capitalize">
                        {location.pathname.split('/').pop() || 'Overview'}
                    </h1>
                </div>
                <div className="min-w-0 p-3 sm:p-6 md:p-8 max-w-5xl mx-auto">
                    <Outlet /> {/* Renders the active dashboard page */}
                </div>
            </main>
        </div>
    );
}