'use client';

import { useState } from 'react';
import CustomerManagement from '@/components/customer-management';
import CemeteryManagementList from '@/components/cemetery-management-list';
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
        <div>
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={() => handleNavigate('menu')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center text-lg"
            >
              ← メニューに戻る
            </button>
          </div>
          <CustomerManagement />
        </div>
      )}
      {currentView === 'burial' && (
        <div className="min-h-screen bg-gray-100">
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={() => handleNavigate('menu')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center text-lg"
            >
              ← メニューに戻る
            </button>
          </div>
          <div className="pt-20 px-8">
            <CemeteryManagementList />
          </div>
        </div>
      )}
      {currentView === 'plots' && (
        <div className="min-h-screen bg-gray-100">
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={() => handleNavigate('menu')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center text-lg"
            >
              ← メニューに戻る
            </button>
          </div>
          <div className="pt-20 px-8">
            <PlotAvailabilityManagement />
          </div>
        </div>
      )}
    </>
  );
}
