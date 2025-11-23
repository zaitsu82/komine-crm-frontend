import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | null) {
  if (!date) return ""
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function formatDateWithEra(date: Date | string | null) {
  if (!date) return ""
  
  // 文字列の日付をDateオブジェクトに変換
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // 無効な日付の場合は空文字列を返す
  if (isNaN(dateObj.getTime())) return ""
  
  const year = dateObj.getFullYear()
  const heiseiStart = 1989
  const reiwaStart = 2019
  
  let era = ""
  let eraYear = 0
  
  if (year >= reiwaStart) {
    era = "令和"
    eraYear = year - reiwaStart + 1
  } else if (year >= heiseiStart) {
    era = "平成"
    eraYear = year - heiseiStart + 1
  }
  
  return `${era}${eraYear}年 ${dateObj.getMonth() + 1}月${dateObj.getDate()}日`
}

// ===== 区画管理ユーティリティ =====

import type { 
  CustomerPlotAssignment, 
  PlotUnit, 
  PlotUnitType,
  PlotAssignmentValidation 
} from "@/types/customer";

/**
 * 有効な収容人数を計算
 * @param baseCapacity 基本収容人数
 * @param capacityOverride 収容人数の上書き
 * @returns 有効な収容人数
 */
export function calculateEffectiveCapacity(
  baseCapacity: number,
  capacityOverride?: number
): number {
  return capacityOverride ?? baseCapacity;
}

/**
 * 面積ベースの提案価格を計算
 * @param areaSqm 面積（平方メートル）
 * @param type ユニット種別
 * @returns 提案価格（円）
 */
export function calculateSuggestedPrice(
  areaSqm: number | undefined,
  type: PlotUnitType
): number | undefined {
  if (!areaSqm) return undefined;
  
  // 種別ごとの単価（㎡あたり）
  const unitPrices: Record<PlotUnitType, number> = {
    grave_site: 150000,    // 墓地区画: 15万円/㎡
    columbarium: 200000,   // 納骨堂: 20万円/㎡
    ossuary: 100000,       // 合葬墓: 10万円/㎡
    other: 100000,         // その他: 10万円/㎡
  };
  
  const unitPrice = unitPrices[type];
  return Math.round(areaSqm * unitPrice);
}

/**
 * 区画割当の業務ルールバリデーション
 * @param assignment 区画割当情報
 * @param existingUnits 既存ユニット一覧（在庫確認用）
 * @returns バリデーション結果
 */
export function validatePlotAssignment(
  assignment: Partial<CustomerPlotAssignment>,
  existingUnits?: PlotUnit[]
): PlotAssignmentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 基本チェック: plotNumber または draftUnit のどちらかが必要
  if (!assignment.plotNumber && !assignment.draftUnit) {
    errors.push("既存区画の選択または新規区画の情報が必要です");
  }
  
  // 収容人数チェック
  if (assignment.effectiveCapacity !== undefined) {
    if (assignment.effectiveCapacity < 1) {
      errors.push("収容人数は1人以上である必要があります");
    }
    if (assignment.effectiveCapacity > 50) {
      errors.push("収容人数は50人以下である必要があります");
    }
  }
  
  // 合祀不可のユニットへの複数名割当の警告
  if (assignment.allowGoushi === false && (assignment.effectiveCapacity ?? 0) > 1) {
    warnings.push(
      "合祀不可に設定されていますが、収容人数が2人以上になっています。" +
      "将来的に複数名の埋葬が必要な場合は、合祀可に変更してください。"
    );
  }
  
  // 価格の妥当性チェック
  if (assignment.price !== undefined && assignment.price < 0) {
    errors.push("価格は0以上である必要があります");
  }
  
  // 面積の妥当性チェック
  if (assignment.draftUnit?.areaSqm !== undefined) {
    if (assignment.draftUnit.areaSqm <= 0) {
      errors.push("面積は正の数値である必要があります");
    }
    if (assignment.draftUnit.areaSqm > 100) {
      warnings.push("面積が100㎡を超えています。正しい値かご確認ください。");
    }
  }
  
  // 既存ユニットの在庫確認
  if (assignment.plotNumber && existingUnits) {
    const unit = existingUnits.find(u => u.plotNumber === assignment.plotNumber);
    if (unit) {
      if (unit.currentStatus === 'in_use') {
        warnings.push(
          `区画 ${assignment.plotNumber} は既に使用中です。` +
          "重複して割り当てる場合は、共同使用であることをご確認ください。"
        );
      }
      if (unit.currentStatus === 'reserved') {
        warnings.push(
          `区画 ${assignment.plotNumber} は既に予約済みです。` +
          "別の顧客が予約している可能性があります。"
        );
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 複数の区画割当に対する重複チェック
 * @param assignments 区画割当リスト
 * @returns バリデーション結果
 */
export function validatePlotAssignments(
  assignments: Partial<CustomerPlotAssignment>[]
): PlotAssignmentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 同一顧客内での区画番号の重複チェック
  const plotNumbers = assignments
    .map(a => a.plotNumber)
    .filter((n): n is string => !!n);
  
  const duplicates = plotNumbers.filter(
    (num, index) => plotNumbers.indexOf(num) !== index
  );
  
  if (duplicates.length > 0) {
    errors.push(
      `同一の区画が複数回選択されています: ${[...new Set(duplicates)].join(", ")}`
    );
  }
  
  // 各割当の個別バリデーション
  assignments.forEach((assignment, index) => {
    const result = validatePlotAssignment(assignment);
    errors.push(...result.errors.map(e => `区画${index + 1}: ${e}`));
    warnings.push(...result.warnings.map(w => `区画${index + 1}: ${w}`));
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 区画番号のフォーマット（表示用）
 * @param section 区域
 * @param number 番号
 * @returns フォーマット済み区画番号（例: "東区-A-56"）
 */
export function formatPlotNumber(section: string, number: string): string {
  return `${section}-${number}`;
}

/**
 * 価格を日本円形式でフォーマット
 * @param price 価格
 * @returns フォーマット済み価格文字列（例: "¥1,500,000"）
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined) return "未設定";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price);
}