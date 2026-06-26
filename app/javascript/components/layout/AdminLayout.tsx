import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/Admin/Sidebar';
import { toast } from 'react-toastify';
import { usePage } from '@inertiajs/react';



function AdminLayout({ children }: { children: React.ReactNode }) {
    const {flash} = usePage().props
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false)
    const [darkMode, setDarkMode] = useState<boolean>(false)

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


    // Sync HTML body dark class
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans transition-colors duration-150 selection:bg-indigo-500/20 pb-36">



            {/* Sidebar Navigation */}
            <Sidebar
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                horsesCount={12}
                isOpen={mobileSidebarOpen}
                setIsOpen={setMobileSidebarOpen}
            />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 p-4 sm:p-8 mt-14 lg:mt-0 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}

export default AdminLayout