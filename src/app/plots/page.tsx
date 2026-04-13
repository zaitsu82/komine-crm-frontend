'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlotListItem } from '@komine/types';
import { AuthGuard } from '@/components/auth-guard';
import PlotListTable from '@/components/plot-list-table';
import { Button } from '@/components/ui/button';

const SCROLL_KEY = 'plots-list-scroll';

export default function PlotsPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // スクロール位置の復元
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved && scrollRef.current) {
      const scrollTop = parseInt(saved, 10);
      // DOM描画後にスクロール復元（データ表示を待つ）
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo(0, scrollTop);
      });
    }
  }, []);

  // スクロール位置の保存
  const saveScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      sessionStorage.setItem(SCROLL_KEY, String(scrollRef.current.scrollTop));
    }
  }, []);

  const handlePlotSelect = (plot: PlotListItem) => {
    saveScrollPosition();
    router.push(`/plots/${plot.id}`);
  };

  const handleNavigateToMenu = () => {
    router.push('/');
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-shiro">
        {/* モバイルオーバーレイ */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* サイドバー */}
        <div className={`fixed md:static top-0 left-0 h-screen md:h-auto w-56 bg-white border-r border-gin shadow-elegant flex flex-col z-50 transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="p-4 bg-gradient-matsu text-white">
            <h3 className="font-mincho text-lg font-semibold tracking-wide">区画管理台帳</h3>
          </div>
          <div className="p-2 flex-1">
            <Button
              onClick={handleNavigateToMenu}
              className="w-full mb-3"
              variant="outline"
              size="lg"
            >
              ← メインメニューに戻る
            </Button>
            <nav className="space-y-1">
              <SidebarItem label="台帳問い合わせ" active onClick={() => setMobileSidebarOpen(false)} />
              <SidebarItem label="新規登録" onClick={() => { setMobileSidebarOpen(false); router.push('/plots/new'); }} />
            </nav>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* モバイルヘッダー */}
          <div className="md:hidden flex items-center h-14 px-4 border-b border-gin bg-white flex-shrink-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-sumi hover:bg-kinari"
              aria-label="メニューを開く"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="ml-3 font-mincho text-base font-semibold text-sumi truncate">区画管理台帳</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto p-4 md:p-6">
            <PlotListTable
              onPlotSelect={handlePlotSelect}
              title="台帳問い合わせ"
              showSearch
              showSortControls
              showAiueoTabs
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function SidebarItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${active
        ? 'bg-matsu-50 text-matsu font-semibold'
        : 'hover:bg-kinari text-sumi'
        }`}
    >
      {label}
    </button>
  );
}
