import { usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, FileCode, Sun, Moon, CloudLightning, Menu, X } from 'lucide-react';
import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react';

interface SidebarProps {
    darkMode: boolean;
    setDarkMode: (dark: boolean) => void;
    horsesCount: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({

    darkMode,
    setDarkMode,
    horsesCount,
    isOpen,
    setIsOpen
}: SidebarProps) {

    const [serverLive, setServerLive] = useState<boolean>()

    const menuItems = [
        {
            id: 'dashboard' as const,
            label: 'Dashboard Overview',
            icon: LayoutDashboard,
            badge: null,
            url: '/admin'
        },
        {
            id: 'horses' as const,
            label: 'Horses Registry',
            icon: Users,
            badge: horsesCount,
            url: '/admin/horses'
        },

    ];

    const { user } = usePage().props.auth

    const fetchServerStatus = async () => {
        console.log("Checking Server Status")
        const res = await fetch('/up')
        if (res.status == 200) {
            setServerLive(true);
            return;
        }
        setServerLive(false);
    }

    useEffect(() => {
        fetchServerStatus()
        const serverStatusInterval = setInterval(fetchServerStatus, 60000)

        return () => clearInterval(serverStatusInterval)

    }, [])

    return (
        <>
            {/* Mobile top navigation bar */}
            <div className="lg:hidden h-14 bg-slate-900 border-b border-slate-800 text-white px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow">
                <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-600">
                        <CloudLightning className="h-4.5 w-4.5 text-white" />
                    </span>
                    <span className="font-extrabold text-sm tracking-tight font-sans">
                        DDCattle Company Admin
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                        {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                    </button>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-900 text-slate-400 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:pt-0 pt-14`}
            >
                {/* Top brand header */}
                <div className="p-6 border-b border-slate-900 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20">
                            <CloudLightning className="h-5 w-5 animate-pulse" />
                        </span>
                        <div>
                            <h1 className="font-black text-sm tracking-tight text-white font-sans uppercase">
                                Silver Saddle
                            </h1>
                            <p className="text-[10px] text-slate-500 font-semibold tracking-wider font-mono">
                                ROR + INERTIA + R2
                            </p>
                        </div>
                    </div>

                    {/* System status tags */}
                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1.5 font-mono">
                                <span className={`h-1.5 w-1.5 rounded-full ${serverLive ? 'bg-green-500' : 'bg-red-500'} ${serverLive && 'animate-ping'}`}></span>
                                Rails Server
                            </span>
                            <span className="text-slate-400 font-mono font-bold">{serverLive ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1.5 font-mono">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Cloudflare R2
                            </span>
                            <span className="text-slate-400 font-mono font-bold">CONNECTED</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu Links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <span className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 font-mono">
                        Navigation Console
                    </span>

                    {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = window.location.pathname === item.url;

                        return (
                            <Link href={item.url}
                                key={item.id}
                                onClick={() => {
                                    setIsOpen(false); // Close sidebar on mobile select
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold font-sans transition duration-150 ${isActive
                                        ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/10'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <IconComponent className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </div>

                                {item.badge !== null && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-400'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}


                </nav>

                {/* Footer Area: User Profile */}
                <div className="p-4  space-y-4">
                    {/* Sarah Jenkins Profile */}
                    <div className="flex flex-col items-start gap-3 p-1.5 bg-slate-900/40 rounded-xl border border-slate-900/60">

                        <div className="w-full border-t border-slate-900">
                            <h4 className="text-md font-bold text-slate-200 ">{user?.username}</h4>
                        </div>
                        <div className="w-full border-t border-slate-900">
                           <Link href='/logout' method='delete' className='p-3 rounded w-full pointer-cursor hover:bg-red-800 hover:text-white '>Signout</Link>
                        </div>
                    </div>

                    {/* Quick theme toggler & help */}
                    <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="flex items-center gap-1.5 hover:text-slate-400 transition"
                        >
                            {darkMode ? (
                                <>
                                    <Sun className="h-3.5 w-3.5" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="h-3.5 w-3.5" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                        <span className="text-[10px] text-slate-700 font-mono">v1.0.0-demo</span>
                    </div>
                </div>
            </aside>

            {/* Sidebar background overlay for mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
                ></div>
            )}
        </>
    );
}
