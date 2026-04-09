'use client';

import { ReactNode } from 'react';
import { Eye, ArrowRight } from 'lucide-react';
import { BaseDialog } from './BaseDialog';

/** プレビュー項目（単純表示） */
export interface PreviewItem {
  label: string;
  value: ReactNode;
}

/** プレビュー項目（差分表示） */
export interface PreviewDiffItem {
  label: string;
  before: ReactNode;
  after: ReactNode;
}

/** プレビューセクション */
export interface PreviewSection {
  title: string;
  items: PreviewItem[];
}

/** 差分プレビューセクション */
export interface PreviewDiffSection {
  title: string;
  items: PreviewDiffItem[];
}

interface PreviewDialogProps {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 閉じるコールバック */
  onClose: () => void;
  /** 確認して送信コールバック */
  onConfirm: () => void;
  /** タイトル */
  title?: string;
  /** 説明テキスト */
  description?: string;
  /** 新規登録時のプレビューセクション */
  sections?: PreviewSection[];
  /** 更新時の差分プレビューセクション */
  diffSections?: PreviewDiffSection[];
  /** 確認ボタンのテキスト */
  confirmText?: string;
  /** キャンセルボタンのテキスト */
  cancelText?: string;
  /** ローディング状態 */
  isLoading?: boolean;
  /** ダイアログサイズ */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

function formatValue(value: ReactNode): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-hai italic">未入力</span>;
  }
  return value;
}

function SectionView({ section }: { section: PreviewSection }) {
  const visibleItems = section.items.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== ''
  );
  if (visibleItems.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-sumi mb-2 border-b border-gin pb-1">
        {section.title}
      </h4>
      <dl className="grid grid-cols-[minmax(120px,auto)_1fr] gap-x-4 gap-y-1.5">
        {visibleItems.map((item, i) => (
          <div key={i} className="contents">
            <dt className="text-sm text-hai py-0.5">{item.label}</dt>
            <dd className="text-sm text-sumi py-0.5">{formatValue(item.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DiffSectionView({ section }: { section: PreviewDiffSection }) {
  const changedItems = section.items.filter((item) => {
    const beforeStr = String(item.before ?? '');
    const afterStr = String(item.after ?? '');
    return beforeStr !== afterStr;
  });
  if (changedItems.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-sumi mb-2 border-b border-gin pb-1">
        {section.title}
      </h4>
      <dl className="space-y-1.5">
        {changedItems.map((item, i) => (
          <div key={i} className="grid grid-cols-[minmax(120px,auto)_1fr] gap-x-4 items-start">
            <dt className="text-sm text-hai py-0.5">{item.label}</dt>
            <dd className="flex items-center gap-2 text-sm py-0.5">
              <span className="text-hai line-through">{formatValue(item.before)}</span>
              <ArrowRight className="w-3.5 h-3.5 text-hai flex-shrink-0" />
              <span className="text-sumi font-medium">{formatValue(item.after)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * プレビューダイアログコンポーネント
 *
 * フォーム送信前に入力内容を確認するための共通ダイアログ。
 * - 新規登録時: sections でキー・バリュー一覧表示
 * - 更新時: diffSections で変更前→変更後の差分表示
 */
export function PreviewDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '入力内容の確認',
  description,
  sections,
  diffSections,
  confirmText = '確認して送信',
  cancelText = '戻る',
  isLoading = false,
  size = 'lg',
}: PreviewDialogProps) {
  const hasDiff = diffSections && diffSections.some((s) => s.items.some((item) => {
    const beforeStr = String(item.before ?? '');
    const afterStr = String(item.after ?? '');
    return beforeStr !== afterStr;
  }));

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 border border-gin rounded-md text-sumi bg-white hover:bg-shiro disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className="px-4 py-2 rounded-md text-white bg-ai hover:bg-ai-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            送信中...
          </span>
        ) : (
          confirmText
        )}
      </button>
    </>
  );

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      size={size}
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
    >
      <div className="flex items-center gap-2 mb-4 p-3 bg-ai/5 rounded-md border border-ai/20">
        <Eye className="w-5 h-5 text-ai flex-shrink-0" />
        <p className="text-sm text-sumi">
          {diffSections
            ? '変更内容を確認してください。問題なければ「確認して送信」を押してください。'
            : '入力内容を確認してください。問題なければ「確認して送信」を押してください。'}
        </p>
      </div>

      <div className="space-y-4">
        {sections?.map((section, i) => (
          <SectionView key={i} section={section} />
        ))}
        {diffSections?.map((section, i) => (
          <DiffSectionView key={i} section={section} />
        ))}
        {diffSections && !hasDiff && (
          <p className="text-sm text-hai text-center py-4">変更された項目はありません</p>
        )}
      </div>
    </BaseDialog>
  );
}
