'use client';

import Link from 'next/link';

/**
 * 404 Not Found ページ
 * 存在しないURLにアクセスした場合に表示
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-12">
            <div className="text-8xl font-bold text-white/20 mb-2">404</div>
            <h1 className="text-2xl font-bold text-white">ページが見つかりません</h1>
          </div>

          {/* コンテンツ */}
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              お探しのページは存在しないか、
              <br />
              移動した可能性があります。
            </p>

            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                ホームに戻る
              </Link>

              <button
                onClick={() => typeof window !== 'undefined' && window.history.back()}
                className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                前のページに戻る
              </button>
            </div>
          </div>

          {/* フッター */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-xs text-gray-400">
              小峰霊園CRM - Komine Cemetery CRM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
