import React, { useState, ReactNode, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { auth, flash } = usePage().props;
  const user = auth?.user;


  const showSuccess = (message:string) => {
  toast.success(message, {
    style: {
      background: '#ecfdf5',    // Light green background
      color: '#065f46',           // Dark green text
      border: '1px solid #a7f3d0',
      borderRadius: '8px',
    },

  });
};

const showFailure = (message:string) => {
  toast.error(message, {
    style: {
      background: '#fef2f2',    // Light red background
      color: '#991b1b',           // Dark red text
      border: '1px solid #fecaca',
      borderRadius: '8px',
    },
  });
};

  useEffect(() => {
    if(flash?.notice) showSuccess(flash.notice.message);
    if(flash?.alert) showFailure(flash.alert.message);
  }, [flash?.notice, flash?.alert])


  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark font-sans flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-brand-tan sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">

            {/* Logo area */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-display text-2xl font-bold tracking-wide text-brand-dark hover:text-brand-clay transition-colors">
                DD<span className="text-brand-clay">CATTLE</span> <span className="font-sans text-xs uppercase tracking-widest block font-medium text-gray-500">Co. & Mustangs</span>
              </Link>
            </div>

            {/* Desktop Navigation links */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/horses" className="text-sm font-medium hover:text-brand-clay transition-colors">The Horses</Link>
              <Link href="/about" className="text-sm font-medium hover:text-brand-clay transition-colors">Our Story</Link>
              <Link href="/contact" className="ml-4 bg-brand-clay hover:bg-opacity-95 text-brand-cream text-sm font-medium px-5 py-2.5 rounded-md transition-all shadow-xs">
                Get in Touch
              </Link>
              {user ?
                <>
                  <span>Welcome, {user.username}</span>
                  <Link href={'/logout'} method='delete'>Logout</Link>
                </>
                : <Link href='/login'>Login</Link>
              }
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-brand-dark hover:text-brand-clay focus:outline-hidden"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                {/* Visual Accessibility label */}
                <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
                {isOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-brand-cream border-t border-brand-tan`} id="mobile-menu">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link onClick={() => setIsOpen(!isOpen)} href="/horses" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-tan">The Mustangs</Link>
            <Link onClick={() => setIsOpen(!isOpen)} href="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-tan">Our Story</Link>
            {!auth?.user && <Link onClick={() => setIsOpen(!isOpen)} href="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-tan">Login</Link>}
            {auth?.user && <Link onClick={() => setIsOpen(!isOpen)} href="/logout" method='delete' className="block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-tan">Logout</Link>}
            <div className="pt-4 px-3">
              <Link onClick={() => setIsOpen(!isOpen)} href="/contact" className="block text-center bg-brand-clay text-brand-cream font-medium py-2.5 px-4 rounded-md shadow-xs">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Page Content Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {flash && <ToastContainer autoClose={1500} />}
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-brand-dark text-brand-tan/80 py-8 border-t border-brand-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs">
          <p>&copy; {new Date().getFullYear()} DDCattle Company. All rights reserved.</p>
          <p className="tracking-wide">Raised on the range, refined by hand.</p>
        </div>
      </footer>
    </div>
  );
}