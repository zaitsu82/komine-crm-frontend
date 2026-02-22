'use client';

import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import BulkImportPage from '@/components/bulk-import';
import { Button } from '@/components/ui/button';

export default function BulkImportRoute() {
  const router = useRouter();

  const handleNavigateToMenu = () => {
    router.push('/');
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-shiro">
        {/* サイドバー */}
        <div className="w-56 bg-white border-r border-gin shadow-elegant flex flex-col">
          <div className="p-4 bg-gradient-matsu text-white">
            <h3 className="font-mincho text-lg font-semibold tracking-wide">一括登録</h3>
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
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-auto">
          <BulkImportPage />
        </div>
      </div>
    </AuthGuard>
  );
}
