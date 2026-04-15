'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import GlobalSidebar from '@/components/layout/GlobalSidebar';
import UserMenu from '@/components/user-menu';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 'md:ml-16' : 'md:ml-64';

  return (
    <AuthGuard>
      <div className="flex h-screen bg-shiro">
        <GlobalSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <div className={`flex-1 flex flex-col ml-0 ${sidebarWidth} transition-all duration-300`}>
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-gin bg-white flex-shrink-0">
            <div className="flex items-center">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 -ml-2 rounded-md text-sumi hover:bg-kinari"
                aria-label="メニューを開く"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="ml-3 font-mincho text-base font-semibold text-sumi truncate">小嶺霊園CRM</span>
            </div>
            <UserMenu />
          </div>

          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
