'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';

const DESKTOP_BREAKPOINT = 768;

interface DesktopOnlyGateProps {
  children: React.ReactNode;
  /**
   * 案内文のカスタマイズ（任意）。指定しない場合は標準文言を表示。
   */
  description?: string;
}

export function DesktopOnlyGate({ children, description }: DesktopOnlyGateProps) {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    // 直前ページがある場合のみ「戻る」ボタンを表示
    // (history.length は SPA 内遷移を含む。1 はこのページが入口=戻れない)
    setCanGoBack(window.history.length > 1);
  }, []);

  if (isDesktop === null) return null;
  if (isDesktop) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div
        className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-kinari text-hai"
        aria-hidden="true"
      >
        <Monitor className="h-8 w-8" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="font-mincho text-lg font-semibold text-sumi">
          この画面はPCでご利用ください
        </h2>
        <p className="text-sm text-hai">
          {description ??
            'この機能は画面幅 768px 以上のPC・タブレット横向きでの利用を想定しています。スマートフォンからは閲覧画面をご利用ください。'}
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {canGoBack && (
          <Button variant="default" onClick={() => router.back()} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            前のページに戻る
          </Button>
        )}
        <Link
          href="/plots"
          className={buttonVariants({ variant: canGoBack ? 'outline' : 'default' })}
        >
          区画一覧へ
        </Link>
        <Link href="/collective-burials" className={buttonVariants({ variant: 'outline' })}>
          合祀管理へ
        </Link>
      </div>
    </div>
  );
}
