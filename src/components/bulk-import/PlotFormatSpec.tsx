/**
 * 区画の一括登録・一括編集で利用する
 * フォーマット仕様の表示セクション（折りたたみ可能）
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  FieldDef,
  FieldType,
  MAIN_SHEET_FIELDS,
  FAMILY_CONTACT_FIELDS,
  BURIED_PERSON_FIELDS,
  CONSTRUCTION_INFO_FIELDS,
  SHEET_NAMES,
  MAX_PLOTS_PER_BATCH,
} from './plotFields';

const TYPE_LABEL: Record<FieldType, string> = {
  string: '文字列',
  number: '数値',
  integer: '整数',
  date: '日付',
  yearMonth: '年月',
  boolean: '真偽値',
  enum: '選択肢',
};

function formatType(f: FieldDef): string {
  const base = TYPE_LABEL[f.type];
  switch (f.type) {
    case 'string':
      return f.maxLength ? `${base}（最大${f.maxLength}文字）` : base;
    case 'date':
      return `${base}（YYYY-MM-DD）`;
    case 'yearMonth':
      return `${base}（YYYY-MM）`;
    case 'boolean':
      return `${base}（true / false）`;
    case 'number':
    case 'integer':
      return f.positive ? `${base}（正の数のみ）` : base;
    default:
      return base;
  }
}

function FieldTable({ fields, mode }: { fields: FieldDef[]; mode: 'create' | 'update' }) {
  return (
    <div className="overflow-x-auto border border-gin rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-kinari border-b border-gin">
            <th className="px-3 py-2 text-left font-semibold text-sumi whitespace-nowrap">フィールド</th>
            <th className="px-3 py-2 text-center font-semibold text-sumi whitespace-nowrap">必須</th>
            <th className="px-3 py-2 text-left font-semibold text-sumi whitespace-nowrap">型</th>
            <th className="px-3 py-2 text-left font-semibold text-sumi">説明</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => {
            const required = mode === 'create' ? f.required === true : false;
            return (
              <tr key={f.path} className="border-b border-gin last:border-0">
                <td className="px-3 py-1.5 font-medium">{f.label}</td>
                <td className="px-3 py-1.5 text-center">
                  {required ? <span className="text-beni">○</span> : <span className="text-hai">-</span>}
                </td>
                <td className="px-3 py-1.5 text-hai whitespace-nowrap">{formatType(f)}</td>
                <td className="px-3 py-1.5 text-hai">{f.description ?? '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PlotFormatSpec({ mode }: { mode: 'create' | 'update' }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = [
    { name: SHEET_NAMES.MAIN, fields: MAIN_SHEET_FIELDS },
    { name: SHEET_NAMES.FAMILY_CONTACTS, fields: FAMILY_CONTACT_FIELDS },
    { name: SHEET_NAMES.BURIED_PERSONS, fields: BURIED_PERSON_FIELDS },
    { name: SHEET_NAMES.CONSTRUCTION_INFOS, fields: CONSTRUCTION_INFO_FIELDS },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium text-sumi mb-3">フォーマット仕様</h3>

        <div className="space-y-2">
          {sections.map((s) => (
            <div key={s.name} className="border border-gin rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(expanded === s.name ? null : s.name)}
                className="w-full flex items-center justify-between px-4 py-2 bg-kinari hover:bg-kinari/80 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-matsu">
                  <svg
                    className={`w-4 h-4 transition-transform ${expanded === s.name ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {s.name}シート（{s.fields.length}項目）
                </span>
              </button>
              {expanded === s.name && (
                <div className="p-3">
                  <FieldTable fields={s.fields} mode={mode} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-hai space-y-1">
          <p className="font-medium text-sumi">注意事項:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>1回の処理で最大{MAX_PLOTS_PER_BATCH}件まで対応</li>
            <li>対応ファイル形式: .xlsx（全シート対応）/ .csv（メインシートのみ）</li>
            <li>1行目はヘッダー行として自動スキップ</li>
            <li>複数行シート（家族連絡先・埋葬者・工事情報）は「区画番号」でメインシートと紐付けます</li>
            {mode === 'create' ? (
              <>
                <li>区画番号が既存データと重複する行はエラー</li>
                <li>1件でもエラーがあると全件登録されません（全件ロールバック）</li>
              </>
            ) : (
              <>
                <li>区画番号で既存データとマッチング。存在しない区画番号はエラー</li>
                <li>空欄セルは「変更しない」として扱われます（既存値を維持）</li>
                <li>1件でもエラーがあると全件更新されません（全件ロールバック）</li>
              </>
            )}
            <li>空行は自動的にスキップされます</li>
            <li>必須項目は列ヘッダーに <span className="text-beni font-medium">*</span> が付きます</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
