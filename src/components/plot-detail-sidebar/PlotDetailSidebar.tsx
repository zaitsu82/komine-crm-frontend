'use client';

import { Button } from '@/components/ui/button';
import { ViewType, MENU_GROUPS, MenuItemConfig, MenuGroupConfig } from '@/types/plot-detail';
import { useAuth } from '@/contexts/auth-context';

// アイコンコンポーネント
function MenuIcon({ icon, className = 'w-5 h-5' }: { icon: MenuItemConfig['icon']; className?: string }) {
  const props = { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'aria-hidden': true as const };
  const pathProps = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.5 };

  switch (icon) {
    case 'search':
      return <svg {...props}><path {...pathProps} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
    case 'archive':
      return <svg {...props}><path {...pathProps} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    case 'grid':
      return <svg {...props}><path {...pathProps} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    case 'file-text':
      return <svg {...props}><path {...pathProps} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'users':
      return <svg {...props}><path {...pathProps} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v-1" /></svg>;
    case 'settings':
      return <svg {...props}><path {...pathProps} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.573-1.066z" /><path {...pathProps} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'upload':
      return <svg {...props}><path {...pathProps} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
  }
}

// 共通フォーカス・カーソルスタイル
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matsu focus-visible:ring-offset-1';

interface PlotDetailSidebarProps {
  currentView: ViewType;
  selectedPlotId: string | null;
  onBackToRegistry: () => void;
  onViewChange: (view: ViewType) => void;
  onDelete?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function PlotDetailSidebar({
  currentView,
  selectedPlotId,
  onBackToRegistry,
  onViewChange,
  onDelete,
  collapsed,
  onToggleCollapse,
}: PlotDetailSidebarProps) {
  const { user } = useAuth();

  // ユーザーロールに基づきグループ内メニュー項目をフィルタリング
  const visibleGroups = MENU_GROUPS.map((group: MenuGroupConfig) => ({
    ...group,
    items: group.items.filter((item: MenuItemConfig) =>
      user ? item.requiredRoles.includes(user.role) : false
    ),
  })).filter(group => group.items.length > 0);

  const isPlotContextView =
    (currentView === 'plot-details' || currentView === 'edit' || currentView === 'document-select' || currentView === 'document-history') &&
    selectedPlotId;

  return (
    <div
      className={`bg-kinari border-r border-gin fixed top-0 left-0 h-screen overflow-y-auto z-10 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      {/* ヘッダー: ロゴ + タイトル + ハンバーガーボタン */}
      <div className={`flex items-center border-b border-gin ${collapsed ? 'flex-col gap-2 p-3' : 'justify-between p-4'}`}>
        {collapsed ? (
          <div
            className="w-10 h-10 rounded-xl bg-gradient-matsu flex items-center justify-center shadow-matsu"
            title="小嶺霊園CRM"
            aria-label="小嶺霊園CRM"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-matsu flex items-center justify-center shadow-matsu">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-mincho text-base font-semibold text-sumi tracking-wide truncate leading-tight">
                小嶺霊園CRM
              </h2>
              <p className="text-[10px] text-hai tracking-[0.15em] uppercase mt-0.5">
                Komine Cemetery
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-md text-hai hover:text-sumi hover:bg-white cursor-pointer transition-colors ${focusRing}`}
          aria-label={collapsed ? 'メニューを開く' : 'メニューを閉じる'}
        >
          {collapsed ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <div className={`flex-1 ${collapsed ? 'px-1.5 py-3' : 'p-4'}`}>
        {/* Plot Context Menu */}
        {isPlotContextView ? (
          <div className="space-y-1 mb-4">
            {collapsed ? (
              <>
                <button
                  onClick={onBackToRegistry}
                  className={`w-full flex justify-center p-2.5 rounded-md text-sumi hover:bg-white cursor-pointer transition-colors ${focusRing}`}
                  title="台帳一覧に戻る"
                  aria-label="台帳一覧に戻る"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="border-t border-gin my-2"></div>
                <button
                  onClick={() => onViewChange('plot-details')}
                  className={`w-full flex justify-center p-2.5 rounded-md cursor-pointer transition-colors ${focusRing} ${currentView === 'plot-details' ? 'bg-sumi text-white' : 'text-sumi hover:bg-white'
                    }`}
                  title="区画詳細"
                  aria-label="区画詳細"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => onViewChange('document-select')}
                  className={`w-full flex justify-center p-2.5 rounded-md cursor-pointer transition-colors ${focusRing} ${currentView === 'document-select' ? 'bg-matsu text-white' : 'text-matsu hover:bg-matsu-50'
                    }`}
                  title="書類作成"
                  aria-label="書類作成"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => onViewChange('document-history')}
                  className={`w-full flex justify-center p-2.5 rounded-md cursor-pointer transition-colors ${focusRing} ${currentView === 'document-history' ? 'bg-ai text-white' : 'text-ai hover:bg-ai-50'
                    }`}
                  title="書類履歴"
                  aria-label="書類履歴"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {user?.role === 'admin' && onDelete && (
                  <>
                    <div className="border-t border-gin my-2"></div>
                    <button
                      onClick={onDelete}
                      className={`w-full flex justify-center p-2.5 rounded-md text-beni hover:bg-beni-50 cursor-pointer transition-colors ${focusRing}`}
                      title="区画情報を削除"
                      aria-label="区画情報を削除"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={onBackToRegistry}
                  className="w-full btn-senior mb-4 cursor-pointer"
                  variant="default"
                  size="lg"
                >
                  台帳一覧に戻る
                </Button>

                <div className="border-t border-gin my-4"></div>

                <Button
                  onClick={() => onViewChange('plot-details')}
                  className={`w-full btn-senior mt-2 border-none cursor-pointer ${currentView === 'plot-details'
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
                  className={`w-full btn-senior mt-2 border-none cursor-pointer ${currentView === 'document-select'
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
                  className={`w-full btn-senior mt-2 border-none cursor-pointer ${currentView === 'document-history'
                    ? 'bg-ai text-white hover:bg-ai-dark'
                    : 'bg-white text-ai hover:bg-ai-50 border-ai'
                    }`}
                  variant={currentView === 'document-history' ? 'default' : 'outline'}
                  size="lg"
                >
                  書類履歴
                </Button>

                {user?.role === 'admin' && onDelete && (
                  <>
                    <div className="border-t border-gin my-4"></div>
                    <Button
                      onClick={onDelete}
                      className="w-full btn-senior mt-2 border-none cursor-pointer bg-white text-beni hover:bg-beni-50 border-beni"
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
              </>
            )}
          </div>
        ) : (
          /* メインメニュー（グループ化） */
          <nav className="space-y-4">
            {visibleGroups.map((group, groupIndex) => (
              <div key={group.label}>
                {/* グループ間の仕切り */}
                {groupIndex > 0 && (
                  <div className="border-t border-gin mb-4"></div>
                )}

                {/* セクション見出し */}
                {!collapsed && (
                  <p className="text-xs font-semibold text-hai uppercase tracking-wider mb-2 px-2">
                    {group.label}
                  </p>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = currentView === item.view;

                    return collapsed ? (
                      <button
                        key={item.view}
                        onClick={() => onViewChange(item.view)}
                        className={`w-full flex justify-center p-2.5 rounded-md cursor-pointer transition-colors ${focusRing} ${isActive
                          ? 'bg-matsu-50 text-matsu border border-matsu-200'
                          : 'text-sumi hover:bg-white hover:text-matsu'
                          }`}
                        title={item.label}
                        aria-label={item.label}
                      >
                        <MenuIcon icon={item.icon} className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        key={item.view}
                        onClick={() => onViewChange(item.view)}
                        className={`w-full flex items-center gap-3 text-left px-3 py-2.5 text-senior-sm rounded-lg cursor-pointer transition-all duration-200 ${focusRing} ${isActive
                          ? 'bg-matsu-50 text-matsu border-l-[3px] border-matsu shadow-sm font-medium'
                          : 'text-sumi hover:bg-white hover:text-matsu hover:shadow-sm border-l-[3px] border-transparent'
                          }`}
                      >
                        <MenuIcon icon={item.icon} className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-matsu' : 'text-hai'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
