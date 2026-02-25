'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ViewType, MENU_ITEMS } from '@/types/plot-detail';
import { useAuth } from '@/contexts/auth-context';

interface PlotDetailSidebarProps {
  currentView: ViewType;
  selectedPlotId: string | null;
  onBackToRegistry: () => void;
  onViewChange: (view: ViewType) => void;
  onDelete?: () => void;
}

export default function PlotDetailSidebar({
  currentView,
  selectedPlotId,
  onBackToRegistry,
  onViewChange,
  onDelete,
}: PlotDetailSidebarProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: '管理者',
      manager: 'マネージャー',
      operator: 'オペレーター',
      viewer: '閲覧者',
    };
    return roleLabels[role] || role;
  };
  const getSidebarTitle = () => {
    switch (currentView) {
      case 'plot-details':
      case 'edit':
      case 'document-select':
      case 'document-history':
        return '区画詳細';
      case 'collective-burial':
        return '合祀管理メニュー';
      case 'plot-availability':
        return '区画残数管理メニュー';
      case 'documents':
        return '書類管理メニュー';
      case 'staff-management':
        return 'スタッフ管理メニュー';
      case 'masters':
        return 'マスタ管理メニュー';
      case 'bulk-import':
        return '一括登録メニュー';
      default:
        return '小峰霊園CRM';
    }
  };

  const isPlotContextView =
    (currentView === 'plot-details' || currentView === 'edit' || currentView === 'document-select' || currentView === 'document-history') &&
    selectedPlotId;

  return (
    <div className="w-64 bg-kinari border-r border-gin fixed top-0 left-0 h-screen overflow-y-auto z-10 flex flex-col">
      <div className="p-4 pb-8 flex-1">
        <h2 className="text-lg font-semibold text-sumi mb-4">
          {getSidebarTitle()}
        </h2>

        {/* Plot Context Menu (Visible when a plot is selected and in relevant views) */}
        {isPlotContextView ? (
          <div className="space-y-1 mb-4">
            <Button
              onClick={onBackToRegistry}
              className="w-full btn-senior mb-4"
              variant="default"
              size="lg"
            >
              台帳一覧に戻る
            </Button>

            <div className="border-t border-gin my-4"></div>

            <Button
              onClick={() => onViewChange('plot-details')}
              className={`w-full btn-senior mt-2 border-none ${currentView === 'plot-details'
                ? 'bg-sumi text-white hover:bg-sumi/90'
                : 'bg-white text-sumi hover:bg-kinari border-gin'
                }`}
              variant={currentView === 'plot-details' ? 'default' : 'outline'}
              size="lg"
            >
              区画詳細
            </Button>
            <Button
              onClick={() => onViewChange('document-select')}
              className={`w-full btn-senior mt-2 border-none ${currentView === 'document-select'
                ? 'bg-matsu text-white hover:bg-matsu-dark'
                : 'bg-white text-matsu hover:bg-matsu-50 border-matsu'
                }`}
              variant={currentView === 'document-select' ? 'default' : 'outline'}
              size="lg"
            >
              書類作成
            </Button>
            <Button
              onClick={() => onViewChange('document-history')}
              className={`w-full btn-senior mt-2 border-none ${currentView === 'document-history'
                ? 'bg-ai text-white hover:bg-ai-dark'
                : 'bg-white text-ai hover:bg-ai-50 border-ai'
                }`}
              variant={currentView === 'document-history' ? 'default' : 'outline'}
              size="lg"
            >
              書類履歴
            </Button>

            {/* 削除ボタン（管理者専用） */}
            {user?.role === 'admin' && onDelete && (
              <>
                <div className="border-t border-gin my-4"></div>
                <Button
                  onClick={onDelete}
                  className="w-full btn-senior mt-2 border-none bg-white text-beni hover:bg-beni-50 border-beni"
                  variant="outline"
                  size="lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  区画情報を削除
                </Button>
              </>
            )}
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
                  case '書類管理':
                    return 'documents';
                  case 'スタッフ管理':
                    return 'staff-management';
                  case 'マスタ管理':
                    return 'masters';
                  case '一括登録':
                    return 'bulk-import';
                  default:
                    return 'registry';
                }
              };

              const isActive = () => {
                switch (item) {
                  case '台帳問い合わせ':
                    return currentView === 'registry';
                  case '合祀管理':
                    return currentView === 'collective-burial';
                  case '区画残数管理':
                    return currentView === 'plot-availability';
                  case '書類管理':
                    return currentView === 'documents';
                  case 'スタッフ管理':
                    return currentView === 'staff-management';
                  case 'マスタ管理':
                    return currentView === 'masters';
                  case '一括登録':
                    return currentView === 'bulk-import';
                  default:
                    return false;
                }
              };

              return (
                <button
                  key={index}
                  onClick={() => onViewChange(getViewForItem(item))}
                  className={`w-full text-left px-3 py-2 text-senior-sm rounded-elegant border border-gin bg-kinari hover:bg-matsu-50 hover:border-matsu-200 transition-colors btn-senior ${isActive() ? 'bg-matsu-50 border-matsu-200' : ''
                    }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ユーザー情報とログアウト */}
      <div className="p-4 border-t border-gin bg-kinari">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sumi truncate">{user?.name || 'ゲスト'}</p>
            <p className="text-xs text-hai">{user?.role ? getRoleLabel(user.role) : ''}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full text-hai hover:text-beni hover:border-beni-200 hover:bg-beni-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ログアウト
        </Button>
      </div>
    </div>
  );
}
