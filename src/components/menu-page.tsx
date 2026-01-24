'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

interface MenuPageProps {
  onNavigate: (view: 'customer' | 'burial' | 'plots' | 'menu') => void;
}

export default function MenuPage({ onNavigate }: MenuPageProps) {
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

  return (
    <div className="min-h-screen bg-gradient-warm relative">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-matsu-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cha-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* ユーザー情報とログアウトボタン */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-elegant px-4 py-3 border border-gin/50">
          <div className="text-right">
            <p className="text-sm font-medium text-sumi">{user?.name || 'ゲスト'}</p>
            <p className="text-xs text-hai">{user?.role ? getRoleLabel(user.role) : ''}</p>
          </div>
          <div className="w-px h-8 bg-gin" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="text-hai hover:text-sumi hover:bg-gofun transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ログアウト
          </Button>
        </div>
      </div>

      <div className="relative z-10 p-8 lg:p-12">
        {/* ヘッダー */}
        <header className="mb-16 text-center">
          <div className="inline-block mb-6">
            <div className="w-20 h-1 bg-matsu mx-auto mb-8 rounded-full" />
          </div>
          <h1 className="font-mincho text-4xl md:text-5xl lg:text-6xl font-semibold text-sumi mb-6 tracking-wider">
            霊園管理システム
          </h1>
          <p className="text-lg md:text-xl text-hai tracking-widest">
            Komine Cemetery CRM
          </p>
          <div className="w-32 h-px bg-gin mx-auto mt-8" />
        </header>

        {/* メインコンテンツ */}
        <main className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* 台帳管理カード */}
            <Card
              className="group cursor-pointer hover:shadow-elegant-xl hover:-translate-y-2 transition-all duration-slow border-0 overflow-hidden"
              onClick={() => onNavigate('customer')}
            >
              <CardHeader className="bg-gradient-matsu p-8 relative overflow-hidden">
                {/* 装飾パターン */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-mincho text-2xl md:text-3xl font-semibold mb-3 text-white tracking-wide">
                    台帳管理
                  </h3>
                  <p className="text-white/80 text-base">
                    お客様の基本情報・契約情報を管理
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                <ul className="text-sumi space-y-4">
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-matsu-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-matsu" />
                    </span>
                    <span>お客様情報の登録・編集</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-matsu-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-matsu" />
                    </span>
                    <span>契約内容の管理</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-matsu-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-matsu" />
                    </span>
                    <span>支払い履歴の確認</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-matsu-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-matsu" />
                    </span>
                    <span>墓地区画の情報管理</span>
                  </li>
                </ul>
                <div className="mt-8 p-4 bg-matsu-50 rounded-elegant border border-matsu-100">
                  <p className="text-matsu font-medium text-sm">
                    現在の登録数
                  </p>
                  <p className="text-2xl font-semibold text-matsu-dark mt-1">
                    3,254<span className="text-sm font-normal text-matsu ml-1">件</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 合祀管理カード */}
            <Card
              className="group cursor-pointer hover:shadow-elegant-xl hover:-translate-y-2 transition-all duration-slow border-0 overflow-hidden"
              onClick={() => onNavigate('burial')}
            >
              <CardHeader className="bg-gradient-cha p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-mincho text-2xl md:text-3xl font-semibold mb-3 text-white tracking-wide">
                    合祀管理
                  </h3>
                  <p className="text-white/80 text-base">
                    区画・納骨・合祀状況の一覧管理
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                <ul className="text-sumi space-y-4">
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-cha-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-cha" />
                    </span>
                    <span>区画別の使用状況確認</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-cha-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-cha" />
                    </span>
                    <span>契約年度別の管理</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-cha-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-cha" />
                    </span>
                    <span>納骨日の記録管理</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-cha-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-cha" />
                    </span>
                    <span>合祀人数の把握</span>
                  </li>
                </ul>
                <div className="mt-8 p-4 bg-cha-50 rounded-elegant border border-cha-100">
                  <p className="text-cha-dark font-medium text-sm">
                    使用中区画
                  </p>
                  <p className="text-2xl font-semibold text-cha-dark mt-1">
                    2,856<span className="text-sm font-normal text-cha ml-1">件</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 区画残数管理カード */}
            <Card
              className="group cursor-pointer hover:shadow-elegant-xl hover:-translate-y-2 transition-all duration-slow border-0 overflow-hidden"
              onClick={() => onNavigate('plots')}
            >
              <CardHeader className="bg-gradient-ai p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-mincho text-2xl md:text-3xl font-semibold mb-3 text-white tracking-wide">
                    区画残数管理
                  </h3>
                  <p className="text-white/80 text-base">
                    区画の使用状況・空き状況の管理
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                <ul className="text-sumi space-y-4">
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-ai-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-ai" />
                    </span>
                    <span>区画別使用状況の確認</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-ai-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-ai" />
                    </span>
                    <span>空き区画の検索・管理</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-ai-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-ai" />
                    </span>
                    <span>容量・占有率の把握</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-ai-50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-ai" />
                    </span>
                    <span>区画利用状況の分析</span>
                  </li>
                </ul>
                <div className="mt-8 p-4 bg-ai-50 rounded-elegant border border-ai-100">
                  <p className="text-ai-dark font-medium text-sm">
                    空き区画率
                  </p>
                  <p className="text-2xl font-semibold text-ai-dark mt-1">
                    42.3<span className="text-sm font-normal text-ai ml-1">%</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* フッター */}
        <footer className="mt-20 text-center">
          <div className="w-16 h-px bg-gin mx-auto mb-6" />
          <p className="text-hai text-sm tracking-wider">
            © 2024 Komine Cemetery CRM
          </p>
          <p className="text-hai text-xs mt-2">
            Version 1.0.0
          </p>
        </footer>
      </div>
    </div>
  );
}
