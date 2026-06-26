import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react'

function MenuIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <span className="relative block h-5 w-6" aria-hidden="true">
            <span
                className={`absolute left-0 top-0 h-0.5 w-6 rounded-full bg-current transition duration-300 ${isOpen ? "translate-y-2 rotate-45" : ""
                    }`}
            />
            <span
                className={`absolute left-0 top-2 h-0.5 w-6 rounded-full bg-current transition duration-300 ${isOpen ? "opacity-0" : ""
                    }`}
            />
            <span
                className={`absolute left-0 top-4 h-0.5 w-6 rounded-full bg-current transition duration-300 ${isOpen ? "-translate-y-2 -rotate-45" : ""
                    }`}
            />
        </span>
    );
}

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const { user } = usePage().props.auth

    const navLinks = [
        { href: "/horses", label: "The Horses" },
        { href: "/about", label: "Our Story" },
    ];

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    return (
        <nav className="nav-enter sticky top-0 z-50 border-b border-[#d8c3a3]/70 bg-[#fffaf1]/90 text-[#20150d] shadow-[0_1px_18px_rgba(60,37,21,0.08)] backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-6">
                    <a
                        href="#home"
                        className="group flex min-w-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                        aria-label="DD Cattle Co. and Mustangs home"
                    >
                        <span className="grid h-11 w-11 shrink-0 place-items-center border border-[#a95d38]/35 bg-[#f3e4cc] text-sm font-black tracking-[0.18em] text-[#7b3f25] transition duration-300 group-hover:-rotate-3 group-hover:border-[#a95d38]">
                            DD
                        </span>
                        <span className="leading-none">
                            <span className="block font-serif text-2xl font-bold tracking-[0.12em] text-[#2d1c12] sm:text-3xl">
                                DDCATTLE
                            </span>
                            <span className="mt-1 block text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-[#7b6a58]">
                                Co. & Mustangs
                            </span>
                        </span>
                    </a>

                    <div className="hidden items-center gap-10 md:flex">
                        <div className="flex items-center gap-8" aria-label="Primary navigation">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="nav-link text-sm font-semibold tracking-wide text-[#3a2a1d] transition hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 border-l border-[#d8c3a3] pl-8">
                            {user ? <>
                                <span className="hidden text-sm font-medium text-[#7b6a58] lg:inline">
                                    Welcome, {user.username}
                                </span>
                                <Link
                                    href="/admin"
                                    className="text-sm font-semibold text-[#3a2a1d] transition hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                                >
                                    Dashboard
                                </Link>
                                <Link method='delete'
                                    href="/logout"
                                    className="text-sm font-semibold text-[#3a2a1d] transition hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                                >
                                    Logout
                                </Link>
                            </>
                            :
                              <Link
                                    href="/login"
                                    className="text-sm font-semibold text-[#3a2a1d] transition hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                                >
                                    Login
                                </Link>
                            }
                            <Link
                                href="/contact"
                                className="bg-[#a95d38] px-5 py-3 text-sm font-bold tracking-wide text-[#fffaf1] shadow-[0_10px_22px_rgba(169,93,56,0.22)] transition hover:-translate-y-0.5 hover:bg-[#8f4d2f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen((open) => !open)}
                        type="button"
                        className="inline-flex h-12 w-12 items-center justify-center border border-[#d8c3a3] text-[#2d1c12] transition hover:border-[#a95d38] hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38] md:hidden"
                        aria-controls="mobile-menu"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Close main menu" : "Open main menu"}
                    >
                        <MenuIcon isOpen={isOpen} />
                    </button>
                </div>
            </div>

            <div
                id="mobile-menu"
                className={`overflow-hidden border-t border-[#d8c3a3] bg-[#fffaf1] transition-all duration-300 md:hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                onClick={() => setIsOpen(false)}
                                href={link.href}
                                className="px-2 py-3 text-base font-semibold text-[#2d1c12] transition hover:bg-[#f3e4cc] hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a95d38]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-4 border-t border-[#d8c3a3] pt-4">
                        {user && <div className="mb-3 text-sm font-medium text-[#7b6a58]">
                            Welcome, {user.username}
                        </div>
                        }
                        <div className="grid gap-2 sm:grid-cols-2">
                            {user ? <>
                                <Link
                                    href="/admin"
                                    className="text-sm font-semibold text-[#3a2a1d] transition hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    method='delete'
                                    onClick={() => setIsOpen(false)}
                                    href="/logout"
                                    className="border border-[#d8c3a3] px-4 py-3 text-center text-sm font-bold text-[#2d1c12] transition hover:border-[#a95d38] hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a95d38]"
                                >
                                    Logout
                                </Link>
                            </>:
                              <Link 
                                    href="/login"
                                    className="text-sm font-semibold text-[#3a2a1d] transition hover:text-[#a95d38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a95d38]"
                                >
                                    Login
                                </Link>
                            }
                            <Link
                                onClick={() => setIsOpen(false)}
                                href="/contact"
                                className="bg-[#a95d38] px-4 py-3 text-center text-sm font-bold text-[#fffaf1] transition hover:bg-[#8f4d2f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a95d38]"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar