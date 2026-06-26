import React, { useState, ReactNode, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './Navbar';

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
     <Navbar/>

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