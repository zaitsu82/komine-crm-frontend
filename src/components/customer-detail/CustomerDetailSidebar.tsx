'use client';

import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { ViewType, MENU_ITEMS } from '@/types/customer-detail';

interface CustomerDetailSidebarProps {
  currentView: ViewType;
  selectedCustomer: Customer | null;
  onNavigateToMenu?: () => void;
  onBackToRegistry: () => void;
  onViewChange: (view: ViewType) => void;
  onTermination: () => void;
}

export default function CustomerDetailSidebar({
  currentView,
  selectedCustomer,
  onNavigateToMenu,
  onBackToRegistry,
  onViewChange,
  onTermination,
}: CustomerDetailSidebarProps) {
  const getSidebarTitle = () => {
    switch (currentView) {
      case 'collective-burial':
        return '合祀管理メニュー';
      case 'plot-availability':
        return '区画残数管理メニュー';
      case 'staff-management':
        return 'スタッフ管理メニュー';
      default:
        return '小峰霊園CRM';
    }
  };

  const isCustomerDetailView =
    (currentView === 'details' || currentView === 'document-select' || currentView === 'document-history') &&
    selectedCustomer;

  return (
    <div className="w-64 bg-gray-200 border-r border-gray-300 fixed top-0 left-0 h-screen overflow-y-auto z-10">
      <div className="p-4 pb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {getSidebarTitle()}
        </h2>

        {/* メインメニューに戻るボタン */}
        {onNavigateToMenu && (
          <div className="mb-3">
            <Button
              onClick={onNavigateToMenu}
              className="w-full btn-senior"
              variant="outline"
              size="lg"
            >
              ← メインメニューに戻る
            </Button>
          </div>
        )}

        {/* Customer Context Menu (Visible when a customer is selected and in relevant views) */}
        {isCustomerDetailView ? (
          <div className="space-y-1 mb-4">
            <Button
              onClick={onBackToRegistry}
              className="w-full btn-senior mb-4"
              variant="default"
              size="lg"
            >
              台帳一覧に戻る
            </Button>

            <div className="border-t border-gray-300 my-4"></div>

            <Button
              onClick={() => onViewChange('details')}
              className={`w-full btn-senior mt-2 border-none ${currentView === 'details'
                ? 'bg-gray-700 text-white hover:bg-gray-800'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                }`}
              variant={currentView === 'details' ? 'default' : 'outline'}
              size="lg"
            >
              顧客詳細
            </Button>
            <Button
              onClick={() => onViewChange('document-select')}
              className={`w-full btn-senior mt-2 border-none ${currentView === 'document-select'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white text-green-600 hover:bg-green-50 border-green-600'
                }`}
              variant={currentView === 'document-select' ? 'default' : 'outline'}
              size="lg"
            >
              書類作成
            </Button>
            <Button
              onClick={() => onViewChange('document-history')}
              className={`w-full btn-senior mt-2 border-none ${currentView === 'document-history'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-600'
                }`}
              variant={currentView === 'document-history' ? 'default' : 'outline'}
              size="lg"
            >
              書類履歴
            </Button>

            <div className="border-t border-gray-300 my-4"></div>

            <Button
              onClick={onTermination}
              className={`w-full btn-senior mt-2 border-none ${selectedCustomer.status === 'inactive'
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-white text-red-600 hover:bg-red-50 border-red-600'
                }`}
              variant="outline"
              size="lg"
              disabled={selectedCustomer.status === 'inactive'}
            >
              {selectedCustomer.status === 'inactive' ? '解約済み' : '解約入力'}
            </Button>
          </div>
        ) : (
          <div className="space-y-1 mb-4">
            {MENU_ITEMS.map((item, index) => {
              const getViewForItem = (menuItem: string): ViewType => {
                switch (menuItem) {
                  case '台帳問い合わせ':
                    return 'registry';
                  case '合祀管理':
                    return 'collective-burial';
                  case '区画残数管理':
                    return 'plot-availability';
                  case 'スタッフ管理':
                    return 'staff-management';
                  default:
                    return 'registry';
                }
              };

              const isActive = () => {
                switch (item) {
                  case '台帳問い合わせ':
                    return currentView === 'registry' || currentView === 'search';
                  case '合祀管理':
                    return currentView === 'collective-burial';
                  case '区画残数管理':
                    return currentView === 'plot-availability';
                  case 'スタッフ管理':
                    return currentView === 'staff-management';
                  default:
                    return false;
                }
              };

              return (
                <button
                  key={index}
                  onClick={() => onViewChange(getViewForItem(item))}
                  className={`w-full text-left px-3 py-2 text-senior-sm rounded border border-gray-400 bg-gray-100 hover:bg-blue-100 hover:border-blue-300 transition-colors btn-senior ${isActive() ? 'bg-blue-100 border-blue-300' : ''
                    }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
