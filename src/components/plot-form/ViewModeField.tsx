'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormRegisterReturn } from 'react-hook-form';
import type { MasterItem } from '@/lib/api';

interface ViewModeFieldProps {
  label: string;
  value?: string | number | null;
  viewMode?: boolean;
  required?: boolean;
  placeholder?: string;
  type?: string;
  register?: UseFormRegisterReturn;
  error?: string;
  className?: string;
}

export function ViewModeField({
  label,
  value,
  viewMode,
  required,
  placeholder,
  type = 'text',
  register,
  error,
  className = '',
}: ViewModeFieldProps) {
  const displayValue = value?.toString() || '';

  return (
    <div className={className}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-beni"> *</span>}
      </Label>
      {viewMode ? (
        <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[38px] text-sm">
          {displayValue || '-'}
        </div>
      ) : (
        <>
          <Input
            type={type}
            placeholder={placeholder}
            className="mt-1"
            {...register}
            required={required}
          />
          {error && <p className="text-beni text-sm mt-1">{error}</p>}
        </>
      )}
    </div>
  );
}

interface ViewModeSelectProps {
  label: string;
  value?: string;
  displayValue?: string;
  viewMode?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function ViewModeSelect({
  label,
  value,
  displayValue,
  viewMode,
  required,
  placeholder,
  disabled,
  onValueChange,
  children,
}: ViewModeSelectProps) {
  return (
    <div>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-beni"> *</span>}
      </Label>
      {viewMode ? (
        <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[38px] text-sm">
          {displayValue || value || '-'}
        </div>
      ) : (
        <Select value={value || ''} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

interface MasterFallbackSelectItemProps {
  /** フォームの現在値（master code / 旧int文字列 / 名称） */
  value: string | null | undefined;
  /** 無効を含む全件マスタ（useMasters().allMasters / masterData.all） */
  masters: ReadonlyArray<MasterItem>;
  /** 旧int値 → master code の正規化マップ（料金系のみ。LEGACY_FEE_CODE_MAP） */
  legacyMap?: Record<string, string>;
  /** 選択肢 value の照合キー。relationship は名称を保存するため 'name' */
  matchBy?: 'code' | 'name';
}

/**
 * 既存値が active マスタの選択肢に無い場合の補完 SelectItem（#238）。
 *
 * 無効化済みマスタや未 remap の旧コードを参照する既存データを編集すると、
 * Select のトリガーが空表示になり「見えない値を誤って選び直す」事故につながる。
 * 現在値を表す SelectItem を1件だけ補完描画してこれを防ぐ。
 * RHF が元値を保持するため、未操作なら保存値は変わらない（表示のみの補完）。
 *
 * ラベル: 無効マスタ → 「名称（無効）」 / 旧int値で解決 → 「名称（旧コード）」 /
 * マスタに存在しない値 → 「値（既存値）」
 */
export function MasterFallbackSelectItem({
  value,
  masters,
  legacyMap,
  matchBy = 'code',
}: MasterFallbackSelectItemProps) {
  if (!value) return null;

  // 旧int値はマスタ code へ正規化してから照合する（master-resolve と同じ規約）
  const normalized = legacyMap?.[value] ?? value;
  const match =
    matchBy === 'name'
      ? masters.find((m) => m.name === normalized)
      : masters.find((m) => m.code === normalized || m.id.toString() === normalized);

  // 現在値がそのまま active 選択肢に存在する場合のみ補完不要。
  // 旧int値は active マスタへ解決できても選択肢の value(code) と一致しないため補完が要る。
  const optionValue = match ? (matchBy === 'name' ? match.name : match.code) : null;
  if (match?.isActive && optionValue === value) return null;

  const label = !match
    ? `${value}（既存値）`
    : !match.isActive
      ? `${match.name}（無効）`
      : `${match.name}（旧コード）`;

  return <SelectItem value={value}>{label}</SelectItem>;
}

interface ViewModeTextareaProps {
  label: string;
  value?: string;
  viewMode?: boolean;
  required?: boolean;
  placeholder?: string;
  register?: UseFormRegisterReturn;
  rows?: number;
}

export function ViewModeTextarea({
  label,
  value,
  viewMode,
  required,
  placeholder,
  register,
  rows = 3,
}: ViewModeTextareaProps) {
  return (
    <div>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-beni"> *</span>}
      </Label>
      {viewMode ? (
        <div className="mt-1 px-3 py-2 bg-yellow-50 border rounded-md min-h-[60px] text-sm whitespace-pre-wrap">
          {value || '-'}
        </div>
      ) : (
        <textarea
          placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 border rounded-md resize-none"
          rows={rows}
          {...register}
        />
      )}
    </div>
  );
}
