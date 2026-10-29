import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ role = 'farmer' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Detect role from path prefix
  const currentRole = location.pathname.startsWith('/buyer')
    ? 'buyer'
    : location.pathname.startsWith('/fpo')
    ? 'fpo'
    : location.pathname.startsWith('/admin')
    ? 'admin'
    : 'farmer';

  return (
    <div className="min-h-screen bg-gray-50/70 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar currentRole={currentRole} isDashboard={true} />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-gray-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          role={currentRole}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Workspace Content */}
        <main className="flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-8">
          {/* Mobile breadcrumb / hamburger bar */}
          <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs"
            >
              <Menu className="w-4 h-4 text-emerald-600" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {currentRole} Workspace
            </span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
