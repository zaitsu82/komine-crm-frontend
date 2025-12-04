/**
 * 合祀一覧管理の型定義
 * 
 * 合祀ルール:
 * - 2015年1月以前契約 → 7年後合祀
 * - 2021年4月以降契約 → 13年後合祀
 * - その他 → 33年後合祀
 */

// 区画タイプ（納骨堂の区域）
export type CollectiveBurialSection = '阿弥陀' | '不動' | '天空' | '弥勒';

// 合祀期間タイプ
export type CollectiveBurialPeriodType = '7year' | '13year' | '33year';

// 合祀ステータス
export type CollectiveBurialListStatus = 'pending' | 'completed' | 'cancelled';

/**
 * 合祀一覧レコード
 * 画像のデータ構造に基づく
 */
export interface CollectiveBurialListRecord {
  id: string;
  
  // 契約者情報
  customerId?: string;        // 関連する顧客ID
  customerCode?: string;      // 顧客コード
  name: string;               // 氏名
  nameKana?: string;          // 氏名カナ
  
  // 区画情報
  section: CollectiveBurialSection;  // 区画（阿弥陀、不動、天空、弥勒）
  plotNumber: string;         // 区画番号（例: 51, H-1・7・13, 122・128）
  
  // 契約・納骨情報
  contractYear: number;       // 契約年（西暦）
  burialDate: Date | null;    // 納骨日
  
  // 合祀情報
  collectiveBurialYear: number;  // 合祀予定年（西暦）
  periodType: CollectiveBurialPeriodType;  // 合祀期間タイプ
  count: number;              // 件数（通常1）
  
  // ステータス
  status: CollectiveBurialListStatus;
  
  // メモ・備考
  notes?: string;             // 備考（例: 「2022年再契約」など）
  
  // システム情報
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 合祀年別のグループ化データ
 */
export interface CollectiveBurialYearGroup {
  year: number;
  records: CollectiveBurialListRecord[];
  totalCount: number;
}

/**
 * 合祀一覧のフィルター条件
 */
export interface CollectiveBurialListFilter {
  year?: number;              // 合祀予定年
  section?: CollectiveBurialSection;  // 区画
  searchQuery?: string;       // 名前検索
  status?: CollectiveBurialListStatus;  // ステータス
  contractYearFrom?: number;  // 契約年（開始）
  contractYearTo?: number;    // 契約年（終了）
}

/**
 * 合祀期間を計算するヘルパー関数
 * @param contractDate 契約日
 * @returns 合祀期間タイプと合祀予定年
 */
export function calculateCollectiveBurialPeriod(contractDate: Date): {
  periodType: CollectiveBurialPeriodType;
  yearsUntilBurial: number;
} {
  const contractYear = contractDate.getFullYear();
  const contractMonth = contractDate.getMonth() + 1; // 0-indexed
  
  // 2015年1月以前契約 → 7年後合祀
  if (contractYear < 2015 || (contractYear === 2015 && contractMonth === 1)) {
    return { periodType: '7year', yearsUntilBurial: 7 };
  }
  
  // 2021年4月以降契約 → 13年後合祀
  if (contractYear > 2021 || (contractYear === 2021 && contractMonth >= 4)) {
    return { periodType: '13year', yearsUntilBurial: 13 };
  }
  
  // その他 → 33年後合祀
  return { periodType: '33year', yearsUntilBurial: 33 };
}

/**
 * 合祀予定年を計算
 * @param contractYear 契約年
 * @param periodType 合祀期間タイプ
 * @returns 合祀予定年
 */
export function calculateCollectiveBurialYear(
  contractYear: number,
  periodType: CollectiveBurialPeriodType
): number {
  const yearsMap: Record<CollectiveBurialPeriodType, number> = {
    '7year': 7,
    '13year': 13,
    '33year': 33,
  };
  return contractYear + yearsMap[periodType];
}

/**
 * 合祀期間タイプの表示ラベル
 */
export const COLLECTIVE_BURIAL_PERIOD_LABELS: Record<CollectiveBurialPeriodType, string> = {
  '7year': '7年後合祀（2015年1月以前契約）',
  '13year': '13年後合祀（2021年4月以降契約）',
  '33year': '33年後合祀',
};

/**
 * 区画の表示ラベル
 */
export const COLLECTIVE_BURIAL_SECTION_LABELS: Record<CollectiveBurialSection, string> = {
  '阿弥陀': '阿弥陀',
  '不動': '不動',
  '天空': '天空',
  '弥勒': '弥勒',
};

/**
 * ステータスの表示ラベルと色
 */
export const COLLECTIVE_BURIAL_STATUS_CONFIG: Record<CollectiveBurialListStatus, {
  label: string;
  className: string;
}> = {
  pending: {
    label: '合祀予定',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  completed: {
    label: '合祀完了',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  cancelled: {
    label: 'キャンセル',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
};

