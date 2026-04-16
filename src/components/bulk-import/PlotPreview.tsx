/**
 * 一括登録/編集のプレビュー表示
 *
 * 項目数が多いため、セクションを切り替え可能なタブ方式で表示。
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ParsedPlot } from './plotParser';
import {
  FieldDef,
  FAMILY_CONTACT_FIELDS,
  BURIED_PERSON_FIELDS,
  CONSTRUCTION_INFO_FIELDS,
  MAIN_SHEET_FIELDS,
  SHEET_NAMES,
} from './plotFields';
import { ValidationError } from './plotValidator';

type SectionKey =
  | 'summary'
  | 'main'
  | 'family'
  | 'buried'
  | 'construction';

/**
 * メインシートの「サマリー」列を定義（全80項目を表示すると横に長過ぎるため、要約表示）
 */
const SUMMARY_COLUMNS: Array<{ path: string; label: string }> = [
  { path: 'physicalPlot.plotNumber', label: '区画番号' },
  { path: 'physicalPlot.areaName', label: '区域名' },
  { path: 'contractPlot.contractAreaSqm', label: '契約面積' },
  { path: 'saleContract.contractDate', label: '契約日' },
  { path: 'saleContract.price', label: '金額' },
  { path: 'customer.name', label: '契約者' },
  { path: 'customer.phoneNumber', label: '電話' },
  { path: 'managementFee.managementFee', label: '管理料' },
];

function renderValue(v: unknown): string {
  if (v === undefined || v === null || v === '') return '-';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

function SectionTable({
  rows,
  fields,
  errorRows,
  sheetName,
}: {
  rows: Record<string, unknown>[];
  fields: FieldDef[];
  errorRows: Set<number>;
  sheetName: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-hai text-sm">
        {sheetName}シートにデータはありません
      </div>
    );
  }

  // 表示項目が多すぎる場合は横スクロール
  return (
    <div className="overflow-x-auto border border-gin rounded-lg">
      <table className="text-sm">
        <thead>
          <tr className="bg-kinari border-b border-gin">
            <th className="px-3 py-2 text-left font-semibold text-sumi sticky left-0 bg-kinari whitespace-nowrap">
              行
            </th>
            {fields.map((f) => (
              <th
                key={f.path}
                className="px-3 py-2 text-left font-semibold text-sumi whitespace-nowrap"
              >
                {f.label}
                {f.required && <span className="text-beni ml-0.5">*</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const rowNum = idx + 2;
            const hasError = errorRows.has(rowNum);
            return (
              <tr
                key={idx}
                className={`border-b border-gin last:border-0 ${hasError ? 'bg-beni-50' : 'hover:bg-kinari'
                  }`}
              >
                <td className="px-3 py-1.5 text-hai sticky left-0 bg-inherit whitespace-nowrap">
                  {rowNum}
                </td>
                {fields.map((f) => (
                  <td
                    key={f.path}
                    className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate"
                    title={renderValue(row[f.path])}
                  >
                    {renderValue(row[f.path])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PlotPreview({
  plots,
  errors,
  totalRowCount,
}: {
  plots: ParsedPlot[];
  errors: ValidationError[];
  totalRowCount: number;
}) {
  const [section, setSection] = useState<SectionKey>('summary');

  // サマリー用のフラットデータ
  const summaryRows = plots.map((p) => {
    const obj: Record<string, unknown> = {};
    for (const col of SUMMARY_COLUMNS) {
      obj[col.path] = p.main[col.path];
    }
    obj['_childCount'] =
      p.familyContacts.length +
      p.buriedPersons.length +
      p.constructionInfos.length;
    return obj;
  });

  // シート別エラー行
  const errorRowsBySheet = new Map<string, Set<number>>();
  for (const err of errors) {
    if (!errorRowsBySheet.has(err.sheet)) errorRowsBySheet.set(err.sheet, new Set());
    errorRowsBySheet.get(err.sheet)!.add(err.row);
  }

  const familyRows = plots.flatMap((p) => p.familyContacts);
  const buriedRows = plots.flatMap((p) => p.buriedPersons);
  const constructionRows = plots.flatMap((p) => p.constructionInfos);

  const tabs: Array<{ key: SectionKey; label: string; count: number }> = [
    { key: 'summary', label: 'サマリー', count: plots.length },
    { key: 'main', label: SHEET_NAMES.MAIN, count: plots.length },
    { key: 'family', label: SHEET_NAMES.FAMILY_CONTACTS, count: familyRows.length },
    { key: 'buried', label: SHEET_NAMES.BURIED_PERSONS, count: buriedRows.length },
    { key: 'construction', label: SHEET_NAMES.CONSTRUCTION_INFOS, count: constructionRows.length },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          データプレビュー ({totalRowCount}件)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* セクション切替 */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gin">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSection(t.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors -mb-px ${section === t.key
                ? 'text-matsu border-b-2 border-matsu'
                : 'text-hai hover:text-sumi'
                }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {section === 'summary' && (
          <div className="overflow-x-auto border border-gin rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-kinari border-b border-gin">
                  <th className="px-3 py-2 text-left font-semibold text-sumi">行</th>
                  {SUMMARY_COLUMNS.map((c) => (
                    <th key={c.path} className="px-3 py-2 text-left font-semibold text-sumi whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left font-semibold text-sumi whitespace-nowrap">
                    連動行数
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row, idx) => {
                  const rowNum = idx + 2;
                  const hasError = errorRowsBySheet.get(SHEET_NAMES.MAIN)?.has(rowNum);
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-gin last:border-0 ${hasError ? 'bg-beni-50' : 'hover:bg-kinari'
                        }`}
                    >
                      <td className="px-3 py-1.5 text-hai">{rowNum}</td>
                      {SUMMARY_COLUMNS.map((c) => (
                        <td key={c.path} className="px-3 py-1.5 max-w-[200px] truncate">
                          {renderValue(row[c.path])}
                        </td>
                      ))}
                      <td className="px-3 py-1.5 text-hai text-xs">
                        {row._childCount as number}行
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {section === 'main' && (
          <SectionTable
            rows={plots.map((p) => p.main)}
            fields={MAIN_SHEET_FIELDS}
            errorRows={errorRowsBySheet.get(SHEET_NAMES.MAIN) ?? new Set()}
            sheetName={SHEET_NAMES.MAIN}
          />
        )}

        {section === 'family' && (
          <SectionTable
            rows={familyRows}
            fields={FAMILY_CONTACT_FIELDS}
            errorRows={errorRowsBySheet.get(SHEET_NAMES.FAMILY_CONTACTS) ?? new Set()}
            sheetName={SHEET_NAMES.FAMILY_CONTACTS}
          />
        )}

        {section === 'buried' && (
          <SectionTable
            rows={buriedRows}
            fields={BURIED_PERSON_FIELDS}
            errorRows={errorRowsBySheet.get(SHEET_NAMES.BURIED_PERSONS) ?? new Set()}
            sheetName={SHEET_NAMES.BURIED_PERSONS}
          />
        )}

        {section === 'construction' && (
          <SectionTable
            rows={constructionRows}
            fields={CONSTRUCTION_INFO_FIELDS}
            errorRows={errorRowsBySheet.get(SHEET_NAMES.CONSTRUCTION_INFOS) ?? new Set()}
            sheetName={SHEET_NAMES.CONSTRUCTION_INFOS}
          />
        )}
      </CardContent>
    </Card>
  );
}
