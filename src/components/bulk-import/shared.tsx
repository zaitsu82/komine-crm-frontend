/**
 * 一括登録・一括編集で共通のUI部品
 */

'use client';

import { useRef, DragEvent, ChangeEvent, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidationError } from './plotValidator';

export interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  helperText?: string;
}

export function FileUploadZone({
  file,
  onFileSelect,
  disabled,
  helperText,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const f = e.dataTransfer.files[0];
      if (f) onFileSelect(f);
    },
    [disabled, onFileSelect]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onFileSelect(f);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onFileSelect]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ファイルアップロード</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
            ${disabled
              ? 'border-gin bg-kinari/50 cursor-not-allowed opacity-50'
              : isDragOver
                ? 'border-matsu bg-matsu-50 cursor-pointer'
                : 'border-gin hover:border-matsu hover:bg-kinari cursor-pointer'
            }
          `}
        >
          <svg
            className="w-12 h-12 mx-auto mb-4 text-hai"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {file ? (
            <div>
              <p className="text-sumi font-medium">{file.name}</p>
              <p className="text-sm text-hai mt-1">
                クリックまたはドラッグ&ドロップで別のファイルに変更
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sumi font-medium">ファイルをドラッグ&ドロップ</p>
              <p className="text-sm text-hai mt-1">
                またはクリックしてファイルを選択 (.xlsx, .csv)
              </p>
            </div>
          )}
        </div>
        {helperText && (
          <p className="mt-3 text-xs text-hai text-center">{helperText}</p>
        )}
      </CardContent>
    </Card>
  );
}

export interface ValidationErrorListProps {
  errors: ValidationError[];
}

export function ValidationErrorList({ errors }: ValidationErrorListProps) {
  if (errors.length === 0) return null;

  // シート別にグルーピング
  const bySheet = new Map<string, ValidationError[]>();
  for (const err of errors) {
    if (!bySheet.has(err.sheet)) bySheet.set(err.sheet, []);
    bySheet.get(err.sheet)!.push(err);
  }

  return (
    <div className="mt-4 p-4 bg-beni-50 border border-beni-200 rounded-lg">
      <h4 className="font-semibold text-beni mb-2">
        バリデーションエラー ({errors.length}件)
      </h4>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Array.from(bySheet.entries()).map(([sheet, sheetErrors]) => (
          <div key={sheet}>
            <p className="text-sm font-semibold text-beni">
              {sheet} ({sheetErrors.length}件)
            </p>
            <ul className="space-y-1 mt-1">
              {sheetErrors.slice(0, 50).map((err, idx) => (
                <li key={idx} className="text-sm text-beni">
                  行{err.row} [{err.field}]: {err.message}
                </li>
              ))}
              {sheetErrors.length > 50 && (
                <li className="text-sm text-beni font-medium">
                  ...他 {sheetErrors.length - 50} 件
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface BulkFailureItem {
  row: number;
  plotNumber?: string | null;
  error: {
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}

export interface SubmitResultCardProps {
  mode: 'create' | 'update';
  totalRequested: number;
  succeeded: number;
  failed?: BulkFailureItem[];
  onReset: () => void;
}

export function SubmitResultCard({
  mode,
  totalRequested,
  succeeded,
  failed = [],
  onReset,
}: SubmitResultCardProps) {
  const allSucceeded = failed.length === 0;
  const allFailed = succeeded === 0 && failed.length > 0;
  const partial = !allSucceeded && !allFailed;

  const title = allSucceeded
    ? mode === 'create'
      ? '一括登録が完了しました'
      : '一括編集が完了しました'
    : allFailed
      ? mode === 'create'
        ? '一括登録が失敗しました'
        : '一括編集が失敗しました'
      : mode === 'create'
        ? '一括登録が部分的に完了しました'
        : '一括編集が部分的に完了しました';
  const action = mode === 'create' ? '登録成功' : '更新成功';

  const summaryClass = allSucceeded
    ? 'bg-matsu-50 border-matsu-200'
    : allFailed
      ? 'bg-beni-50 border-beni-200'
      : 'bg-kinari border-gin';
  const titleClass = allSucceeded ? 'text-matsu' : allFailed ? 'text-beni' : 'text-sumi';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">処理結果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-6 border rounded-lg text-center ${summaryClass}`}>
          <svg
            className={`w-16 h-16 mx-auto mb-4 ${titleClass}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {allSucceeded ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            )}
          </svg>
          <h3 className={`text-xl font-semibold mb-2 ${titleClass}`}>{title}</h3>
          <p className="text-sumi">
            リクエスト数: {totalRequested}件 / {action}: {succeeded}件
            {failed.length > 0 && ` / 失敗: ${failed.length}件`}
          </p>
        </div>

        {failed.length > 0 && (
          <div className="mt-6 p-4 bg-beni-50 border border-beni-200 rounded-lg">
            <h4 className="font-semibold text-beni mb-2">
              失敗した行 ({failed.length}件)
              {partial && ' — 他行は正常に処理されました'}
            </h4>
            <ul className="space-y-1 max-h-96 overflow-y-auto">
              {failed.slice(0, 100).map((f, idx) => (
                <li key={idx} className="text-sm text-beni">
                  行{f.row + 1}
                  {f.plotNumber ? `（${f.plotNumber}）` : ''}: {f.error.message}
                  {f.error.details && f.error.details.length > 0 && (
                    <ul className="ml-4 text-xs opacity-80">
                      {f.error.details.map((d, i) => (
                        <li key={i}>
                          {d.field ? `[${d.field}] ` : ''}
                          {d.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              {failed.length > 100 && (
                <li className="text-sm text-beni font-medium">
                  ...他 {failed.length - 100} 件
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button onClick={onReset}>新しいファイルをアップロード</Button>
        </div>
      </CardContent>
    </Card>
  );
}
