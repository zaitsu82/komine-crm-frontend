'use client';

import { shouldUseMockData } from '@/lib/api/client';

/**
 * デモ（モック）データ表示中であることを全画面で明示するバナー（#176 / #192）
 *
 * `NEXT_PUBLIC_USE_MOCK_DATA=true` のとき、画面のデータはサンプルで
 * 実際の台帳・契約・顧客とは紐づいていない。台帳と合祀など画面間で
 * データが食い違って「別世界のサンプルに見える」混乱を防ぐため、
 * デモデータであることを常時明示する。本番（フラグ false）では何も描画しない。
 *
 * #192: 画面上の「試験」表示が「テスト環境なのか試験用データなのか」曖昧だった点に対応。
 * 「試験環境」バッジ（ツールチップ付き）で、サンプルデータで動作する試験／デモ環境であり
 * 本番データではないことを明示する。本番ではバナーごと非表示になるため、本番データを
 * 試験用と誤解させない。
 */
export default function MockDataBanner() {
  if (!shouldUseMockData()) return null;

  return (
    <div
      role="status"
      className="shrink-0 flex items-center gap-2 bg-kohaku-50 border-b border-kohaku-200 px-3 md:px-6 py-1.5 text-kohaku-dark"
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <span
        className="shrink-0 inline-flex items-center rounded-full bg-kohaku-200/70 px-2 py-0.5 text-[10px] md:text-xs font-semibold text-kohaku-dark"
        title="サンプルデータで動作する試験（デモ）環境です。本番の台帳・契約データではありません。本番環境ではこの表示は出ません。"
      >
        試験環境
      </span>
      <p className="text-[11px] md:text-xs leading-snug">
        <span className="font-semibold">デモデータ表示中</span>
        <span className="ml-2">
          画面のデータはサンプル（試験用）です。実際の台帳・契約・顧客とは紐づいていません。本番環境では表示されません。
        </span>
      </p>
    </div>
  );
}
