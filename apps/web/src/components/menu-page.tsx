'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuPageProps {
  onNavigate: (view: 'customer' | 'burial' | 'plots' | 'menu') => void;
}

export default function MenuPage({ onNavigate }: MenuPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          霊園管理システム
        </h1>
        <p className="text-2xl text-gray-600">
          Komine Cemetery CRM
        </p>
      </header>

      <main className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 台帳管理カード */}
          <Card 
            className="shadow-2xl border-2 hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => onNavigate('customer')}
          >
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
              <CardTitle className="text-3xl font-bold mb-3">
                台帳管理
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                お客様の基本情報・契約情報を管理
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="text-gray-700 text-lg space-y-3">
                <li className="flex items-start">
                  <span className="mr-3 text-blue-500">✓</span>
                  <span>お客様情報の登録・編集</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-500">✓</span>
                  <span>契約内容の管理</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-500">✓</span>
                  <span>支払い履歴の確認</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-blue-500">✓</span>
                  <span>墓地区画の情報管理</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700 font-semibold">
                  現在の登録数: 3,254件
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 合祀管理カード */}
          <Card 
            className="shadow-2xl border-2 hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => onNavigate('burial')}
          >
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8">
              <CardTitle className="text-3xl font-bold mb-3">
                合祀管理
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                区画・納骨・合祀状況の一覧管理
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="text-gray-700 text-lg space-y-3">
                <li className="flex items-start">
                  <span className="mr-3 text-purple-500">✓</span>
                  <span>区画別の使用状況確認</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-purple-500">✓</span>
                  <span>契約年度別の管理</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-purple-500">✓</span>
                  <span>納骨日の記録管理</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-purple-500">✓</span>
                  <span>合祀人数の把握</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-purple-700 font-semibold">
                  使用中区画: 2,856件
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 区画残数管理カード */}
          <Card 
            className="shadow-2xl border-2 hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => onNavigate('plots')}
          >
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8">
              <CardTitle className="text-3xl font-bold mb-3">
                区画残数管理
              </CardTitle>
              <CardDescription className="text-orange-100 text-lg">
                区画の使用状況・空き状況の管理
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="text-gray-700 text-lg space-y-3">
                <li className="flex items-start">
                  <span className="mr-3 text-orange-500">✓</span>
                  <span>区画別使用状況の確認</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-orange-500">✓</span>
                  <span>空き区画の検索・管理</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-orange-500">✓</span>
                  <span>容量・占有率の把握</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-orange-500">✓</span>
                  <span>区画利用状況の分析</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-700 font-semibold">
                  空き区画率: 42.3%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-600">
        <p className="text-lg">
          © 2024 Komine Cemetery CRM - Version 1.0.0
        </p>
      </footer>
    </div>
  );
}