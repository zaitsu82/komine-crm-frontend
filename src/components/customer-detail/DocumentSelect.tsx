'use client';

import { Button } from '@/components/ui/button';

interface DocumentSelectProps {
  onInvoiceClick: () => void;
  onPostcardClick: () => void;
}

export default function DocumentSelect({
  onInvoiceClick,
  onPostcardClick,
}: DocumentSelectProps) {
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">書類作成テンプレート選択</h2>
        <p className="text-gray-600 mb-8">
          作成したい書類のテンプレートを選択してください。クリックするとプレビュー・編集画面が開き、その場で編集・印刷ができます。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 請求書テンプレート */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
            onClick={onInvoiceClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-semibold bg-green-100 text-green-600 px-2 py-1 rounded">編集可</span>
                <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">印刷</span>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">請求書</h3>
            <p className="text-gray-500 text-sm mb-4">
              標準的な請求書フォーマットです。プレビュー画面で内容を編集し、そのまま印刷またはExcel出力ができます。
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              作成・編集・印刷
            </Button>
          </div>

          {/* はがきテンプレート */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 cursor-pointer transition-all hover:shadow-md group"
            onClick={onPostcardClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-semibold bg-green-100 text-green-600 px-2 py-1 rounded">編集可</span>
                <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">印刷</span>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">Excel</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">はがき（合祀案内など）</h3>
            <p className="text-gray-500 text-sm mb-4">
              官製はがきサイズのレイアウトです。宛名面と文面を編集し、そのまま印刷またはExcel出力ができます。
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              作成・編集・印刷
            </Button>
          </div>

          {/* 今後の拡張用プレースホルダー */}
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center opacity-60">
            <div className="p-3 bg-gray-200 rounded-lg text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-500 mb-1">新しいテンプレート</h3>
            <p className="text-gray-400 text-sm">
              今後追加される書類はこちらに表示されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
