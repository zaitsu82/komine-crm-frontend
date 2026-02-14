'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlotListItem } from '@komine/types';
import { AuthGuard } from '@/components/auth-guard';
import PlotListTable from '@/components/plot-list-table';
import { Button } from '@/components/ui/button';

const SCROLL_KEY = 'plots-list-scroll';

export default function PlotsPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <div className="flex h-screen bg-gray-100">
        {/* サイドバー */}
        <div className="w-56 bg-white border-r border-gray-200 shadow-md flex flex-col">
          <div className="p-4 bg-blue-600 text-white">
            <h3 className="text-lg font-semibold">区画管理台帳</h3>
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
              <SidebarItem label="台帳問い合わせ" active />
              <SidebarItem label="新規登録" onClick={() => router.push('/plots/new')} />
            </nav>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div ref={scrollRef} className="flex-1 overflow-auto p-4">
          <PlotListTable
            onPlotSelect={handlePlotSelect}
            title="台帳問い合わせ"
            showSearch
            showSortControls
            showAiueoTabs
          />
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
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'hover:bg-gray-100 text-gray-700'
        }`}
    >
      {label}
    </button>
  );
}
