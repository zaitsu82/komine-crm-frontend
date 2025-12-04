'use client';

import { useState } from 'react';
import CustomerManagement from '@/components/customer-management';
import CollectiveBurialList from '@/components/collective-burial-list';
import PlotAvailabilityManagement from '@/components/plot-availability-management';
import MenuPage from '@/components/menu-page';

export default function Home() {
  const [currentView, setCurrentView] = useState<'menu' | 'customer' | 'burial' | 'plots'>('menu');

  const handleNavigate = (view: 'menu' | 'customer' | 'burial' | 'plots') => {
    setCurrentView(view);
  };

  return (
    <>
      {currentView === 'menu' && (
        <MenuPage onNavigate={handleNavigate} />
      )}
      {currentView === 'customer' && (
        <CustomerManagement onNavigateToMenu={() => handleNavigate('menu')} />
      )}
      {currentView === 'burial' && (
        <CollectiveBurialList onBack={() => handleNavigate('menu')} />
      )}
      {currentView === 'plots' && (
        <PlotAvailabilityManagement onNavigateToMenu={() => handleNavigate('menu')} />
      )}
    </>
  );
}
