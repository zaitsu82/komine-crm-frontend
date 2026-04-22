'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/page-header';
import { BulkCreatePlotPanel } from './BulkCreatePlotPanel';
import { BulkUpdatePlotPanel } from './BulkUpdatePlotPanel';
import { BulkStaffPanel } from './BulkStaffPanel';

type BulkTab = 'plots-create' | 'plots-update' | 'staff';

export default function BulkImportPage() {
  const [activeTab, setActiveTab] = useState<BulkTab>('plots-create');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        title="一括登録・一括編集"
        subtitle="Excelファイルによるデータ一括インポート"
        theme="ai"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        }
      />

      <div className="flex-1 overflow-auto p-3 md:p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BulkTab)}>
            <TabsList className="flex h-auto w-full max-w-full overflow-x-auto overflow-y-hidden justify-start sm:inline-flex sm:w-auto sm:justify-center">
              <TabsTrigger value="plots-create">
                <span className="sm:hidden">区画登録</span>
                <span className="hidden sm:inline">区画 一括登録</span>
              </TabsTrigger>
              <TabsTrigger value="plots-update">
                <span className="sm:hidden">区画編集</span>
                <span className="hidden sm:inline">区画 一括編集</span>
              </TabsTrigger>
              <TabsTrigger value="staff">
                <span className="sm:hidden">スタッフ登録</span>
                <span className="hidden sm:inline">スタッフ 一括登録</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plots-create">
              <BulkCreatePlotPanel />
            </TabsContent>

            <TabsContent value="plots-update">
              <BulkUpdatePlotPanel />
            </TabsContent>

            <TabsContent value="staff">
              <BulkStaffPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
