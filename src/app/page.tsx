'use client';

import { useState } from 'react';
import CustomerManagement from '@/components/customer-management';
import MenuPage from '@/components/menu-page';

type InitialViewType = 'registry' | 'collective-burial' | 'plot-availability';

export default function Home() {
  const [currentView, setCurrentView] = useState<'menu' | 'customer'>('menu');
  const [initialView, setInitialView] = useState<InitialViewType>('registry');

  const handleNavigate = (view: 'menu' | 'customer' | 'burial' | 'plots') => {
    if (view === 'menu') {
      setCurrentView('menu');
    } else if (view === 'customer') {
      setInitialView('registry');
      setCurrentView('customer');
    } else if (view === 'burial') {
      setInitialView('collective-burial');
      setCurrentView('customer');
    } else if (view === 'plots') {
      setInitialView('plot-availability');
      setCurrentView('customer');
    }
  };

  return (
    <>
      {currentView === 'menu' && (
        <MenuPage onNavigate={handleNavigate} />
      )}
      {currentView === 'customer' && (
        <CustomerManagement
          key={initialView}
          onNavigateToMenu={() => handleNavigate('menu')}
          initialView={initialView}
        />
      )}
    </>
  );
}
