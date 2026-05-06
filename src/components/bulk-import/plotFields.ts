/**
 * 一括登録・一括編集で扱うフィールド定義
 *
 * 一件登録（CreatePlotRequest）と同等の全項目を扱うため、
 * データ駆動で template / parser / validator / preview を生成する。
 */

export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'date'
  | 'yearMonth'
  | 'boolean'
  | 'enum';

export interface FieldDef {
  /** APIペイロード内の path（例: 'physicalPlot.plotNumber'） */
  path: string;
  /** Excel列ヘッダー（日本語） */
  label: string;
  /** 型 */
  type: FieldType;
  /** 必須項目か（一括登録時） */
  required?: boolean;
  /** 最大文字数 */
  maxLength?: number;
  /** 最小値（数値） */
  min?: number;
  /** 正の数値のみ */
  positive?: boolean;
  /** enum選択肢 */
  enumValues?: string[];
  /** 備考・説明 */
  description?: string;
  /** 列幅（Excel） */
  columnWidth?: number;
  /** サンプル値（テンプレートに入れる） */
  example?: string | number;
}

/**
 * メイン区画情報シート（1行=1区画、単数エンティティのみ）
 *
 * 構造：
 * - PhysicalPlot
 * - ContractPlot
 * - SaleContract（顧客役割は簡易的に1つ、複数は別対応）
 * - Customer（契約者）
 * - WorkInfo
 * - UsageFee
 * - ManagementFee
 * - GravestoneInfo
 */
export const MAIN_SHEET_FIELDS: FieldDef[] = [
  // ===== PhysicalPlot（物理区画） =====
  {
    path: 'physicalPlot.plotNumber',
    label: '区画番号',
    type: 'string',
    required: true,
    maxLength: 50,
    description: 'バッチ内・既存データと重複不可。一括編集時はこの値で既存データとマッチング',
    columnWidth: 15,
    example: 'A-001',
  },
  {
    path: 'physicalPlot.areaName',
    label: '区域名',
    type: 'string',
    required: true,
    maxLength: 100,
    columnWidth: 15,
    example: '第1期',
  },
  {
    path: 'physicalPlot.areaSqm',
    label: '物理区画面積(㎡)',
    type: 'number',
    positive: true,
    description: '未入力時は3.6㎡（一括登録時のみ）',
    columnWidth: 15,
    example: 3.6,
  },
  {
    path: 'physicalPlot.notes',
    label: '物理区画備考',
    type: 'string',
    maxLength: 1000,
    columnWidth: 30,
  },

  // ===== ContractPlot（契約区画） =====
  {
    path: 'contractPlot.contractAreaSqm',
    label: '契約面積(㎡)',
    type: 'number',
    required: true,
    positive: true,
    description: '3.6 / 1.8 / 0.9 等',
    columnWidth: 14,
    example: 3.6,
  },
  {
    path: 'contractPlot.locationDescription',
    label: '区画位置説明',
    type: 'string',
    maxLength: 200,
    columnWidth: 20,
  },

  // ===== SaleContract（販売契約） =====
  {
    path: 'saleContract.contractDate',
    label: '契約日',
    type: 'date',
    required: true,
    description: 'YYYY-MM-DD 形式（例: 2026-04-01）',
    columnWidth: 13,
    example: '2026-04-01',
  },
  {
    path: 'saleContract.price',
    label: '契約金額',
    type: 'integer',
    required: true,
    min: 0,
    columnWidth: 12,
    example: 500000,
  },
  {
    path: 'saleContract.paymentStatus',
    label: '支払状態',
    type: 'enum',
    enumValues: ['unpaid', 'partial_paid', 'paid', 'overdue', 'refunded', 'cancelled'],
    description: 'unpaid / partial_paid / paid / overdue / refunded / cancelled',
    columnWidth: 14,
  },
  {
    path: 'saleContract.reservationDate',
    label: '予約日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'saleContract.acceptanceNumber',
    label: '受付番号',
    type: 'string',
    maxLength: 50,
    columnWidth: 14,
  },
  {
    path: 'saleContract.acceptanceDate',
    label: '受付日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'saleContract.staffInCharge',
    label: '担当者',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'saleContract.agentName',
    label: '代理店名',
    type: 'string',
    maxLength: 100,
    columnWidth: 18,
  },
  {
    path: 'saleContract.permitNumber',
    label: '許可番号',
    type: 'string',
    maxLength: 50,
    columnWidth: 14,
  },
  {
    path: 'saleContract.permitDate',
    label: '許可日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'saleContract.startDate',
    label: '開始日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'saleContract.uncollectedAmount',
    label: '未集金額',
    type: 'integer',
    min: 0,
    columnWidth: 12,
  },
  {
    path: 'saleContract.notes',
    label: '契約備考',
    type: 'string',
    maxLength: 1000,
    columnWidth: 30,
  },

  // ===== Customer（契約者） =====
  {
    path: 'customer.name',
    label: '契約者氏名',
    type: 'string',
    required: true,
    maxLength: 100,
    columnWidth: 15,
    example: '田中太郎',
  },
  {
    path: 'customer.nameKana',
    label: '契約者氏名カナ',
    type: 'string',
    required: true,
    maxLength: 100,
    description: '全角カタカナ',
    columnWidth: 18,
    example: 'タナカタロウ',
  },
  {
    path: 'customer.birthDate',
    label: '契約者生年月日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'customer.gender',
    label: '契約者性別',
    type: 'enum',
    enumValues: ['male', 'female', 'other'],
    description: 'male / female / other',
    columnWidth: 10,
  },
  {
    path: 'customer.postalCode',
    label: '契約者郵便番号',
    type: 'string',
    required: true,
    maxLength: 10,
    columnWidth: 13,
    example: '160-0000',
  },
  {
    path: 'customer.address',
    label: '契約者住所',
    type: 'string',
    required: true,
    maxLength: 200,
    columnWidth: 30,
    example: '東京都新宿区西新宿1-1-1',
  },
  {
    path: 'customer.addressLine2',
    label: '契約者住所2',
    type: 'string',
    maxLength: 200,
    columnWidth: 25,
  },
  {
    path: 'customer.registeredAddress',
    label: '本籍地',
    type: 'string',
    maxLength: 200,
    columnWidth: 25,
  },
  {
    path: 'customer.phoneNumber',
    label: '契約者電話番号',
    type: 'string',
    required: true,
    maxLength: 20,
    columnWidth: 15,
    example: '090-1234-5678',
  },
  {
    path: 'customer.faxNumber',
    label: '契約者FAX',
    type: 'string',
    maxLength: 20,
    columnWidth: 15,
  },
  {
    path: 'customer.email',
    label: '契約者メール',
    type: 'string',
    maxLength: 100,
    columnWidth: 22,
  },
  {
    path: 'customer.notes',
    label: '契約者備考',
    type: 'string',
    maxLength: 1000,
    columnWidth: 30,
  },

  // ===== WorkInfo（勤務先） =====
  {
    path: 'workInfo.companyName',
    label: '勤務先名',
    type: 'string',
    maxLength: 100,
    columnWidth: 18,
  },
  {
    path: 'workInfo.companyNameKana',
    label: '勤務先名カナ',
    type: 'string',
    maxLength: 100,
    columnWidth: 18,
  },
  {
    path: 'workInfo.workPostalCode',
    label: '勤務先郵便番号',
    type: 'string',
    maxLength: 10,
    columnWidth: 13,
  },
  {
    path: 'workInfo.workAddress',
    label: '勤務先住所',
    type: 'string',
    maxLength: 200,
    columnWidth: 25,
  },
  {
    path: 'workInfo.workPhoneNumber',
    label: '勤務先電話',
    type: 'string',
    maxLength: 20,
    columnWidth: 15,
  },

  // ===== BillingInfo（請求） =====
  // Phase 2 移行で廃止。Phase 3 で Billing/Payment エンティティとして再設計予定。
  // Refs: zaitsu82/komine-crm-backend#106

  // ===== UsageFee（使用料） =====
  {
    path: 'usageFee.calculationType',
    label: '使用料_計算種別',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },
  {
    path: 'usageFee.taxType',
    label: '使用料_税種別',
    type: 'string',
    maxLength: 20,
    columnWidth: 13,
  },
  {
    path: 'usageFee.billingType',
    label: '使用料_請求種別',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },
  {
    path: 'usageFee.billingYears',
    label: '使用料_請求年数',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },
  {
    path: 'usageFee.area',
    label: '使用料_面積',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'usageFee.unitPrice',
    label: '使用料_単価',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'usageFee.usageFee',
    label: '使用料_金額',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'usageFee.paymentMethod',
    label: '使用料_支払方法',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },

  // ===== ManagementFee（管理料） =====
  {
    path: 'managementFee.calculationType',
    label: '管理料_計算種別',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },
  {
    path: 'managementFee.taxType',
    label: '管理料_税種別',
    type: 'string',
    maxLength: 20,
    columnWidth: 13,
  },
  {
    path: 'managementFee.billingType',
    label: '管理料_請求種別',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },
  {
    path: 'managementFee.billingYears',
    label: '管理料_請求年数',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },
  {
    path: 'managementFee.area',
    label: '管理料_面積',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'managementFee.billingMonth',
    label: '管理料_請求月',
    type: 'string',
    maxLength: 20,
    columnWidth: 13,
  },
  {
    path: 'managementFee.managementFee',
    label: '管理料_金額',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'managementFee.unitPrice',
    label: '管理料_単価',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'managementFee.lastBillingMonth',
    label: '管理料_最終請求月',
    type: 'yearMonth',
    description: 'YYYY-MM 形式（例: 2026-04）',
    columnWidth: 15,
  },
  {
    path: 'managementFee.paymentMethod',
    label: '管理料_支払方法',
    type: 'string',
    maxLength: 20,
    columnWidth: 14,
  },

  // ===== GravestoneInfo（墓石情報） =====
  {
    path: 'gravestoneInfo.gravestoneBase',
    label: '墓石_台石',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'gravestoneInfo.enclosurePosition',
    label: '墓石_囲い位置',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'gravestoneInfo.gravestoneDealer',
    label: '墓石_石材店',
    type: 'string',
    maxLength: 100,
    columnWidth: 15,
  },
  {
    path: 'gravestoneInfo.gravestoneType',
    label: '墓石_種類',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'gravestoneInfo.surroundingArea',
    label: '墓石_周辺区画',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'gravestoneInfo.gravestoneCost',
    label: '墓石_費用',
    type: 'integer',
    min: 0,
    columnWidth: 12,
  },
  {
    path: 'gravestoneInfo.establishmentDeadline',
    label: '墓石_建立期限',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'gravestoneInfo.establishmentDate',
    label: '墓石_建立日',
    type: 'date',
    columnWidth: 13,
  },
];

/**
 * 家族連絡先シート（1区画に複数行可、plotNumber外部キー）
 */
export const FAMILY_CONTACT_FIELDS: FieldDef[] = [
  {
    path: 'plotNumber',
    label: '区画番号',
    type: 'string',
    required: true,
    maxLength: 50,
    description: 'メインシートの区画番号と一致させる',
    columnWidth: 15,
    example: 'A-001',
  },
  {
    path: 'emergencyContactFlag',
    label: '緊急連絡先',
    type: 'boolean',
    description: 'true / false',
    columnWidth: 10,
  },
  {
    path: 'name',
    label: '氏名',
    type: 'string',
    required: true,
    maxLength: 100,
    columnWidth: 15,
    example: '田中花子',
  },
  {
    path: 'nameKana',
    label: '氏名カナ',
    type: 'string',
    maxLength: 100,
    columnWidth: 18,
  },
  {
    path: 'birthDate',
    label: '生年月日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'relationship',
    label: '続柄',
    type: 'string',
    required: true,
    maxLength: 50,
    columnWidth: 12,
    example: '配偶者',
  },
  {
    path: 'postalCode',
    label: '郵便番号',
    type: 'string',
    maxLength: 10,
    columnWidth: 12,
  },
  {
    path: 'address',
    label: '住所',
    type: 'string',
    required: true,
    maxLength: 200,
    columnWidth: 25,
  },
  {
    path: 'phoneNumber',
    label: '電話番号',
    type: 'string',
    required: true,
    maxLength: 20,
    columnWidth: 15,
  },
  {
    path: 'phoneNumber2',
    label: '電話番号2',
    type: 'string',
    maxLength: 20,
    columnWidth: 15,
  },
  {
    path: 'faxNumber',
    label: 'FAX',
    type: 'string',
    maxLength: 20,
    columnWidth: 15,
  },
  {
    path: 'email',
    label: 'メール',
    type: 'string',
    maxLength: 100,
    columnWidth: 20,
  },
  {
    path: 'registeredAddress',
    label: '本籍地',
    type: 'string',
    maxLength: 200,
    columnWidth: 25,
  },
  {
    path: 'workCompanyName',
    label: '勤務先',
    type: 'string',
    maxLength: 100,
    columnWidth: 18,
  },
  {
    path: 'workAddress',
    label: '勤務先住所',
    type: 'string',
    maxLength: 200,
    columnWidth: 25,
  },
  {
    path: 'workPhoneNumber',
    label: '勤務先電話',
    type: 'string',
    maxLength: 20,
    columnWidth: 15,
  },
  {
    path: 'contactMethod',
    label: '連絡方法',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'notes',
    label: '備考',
    type: 'string',
    maxLength: 1000,
    columnWidth: 25,
  },
];

/**
 * 埋葬者シート（1区画に複数行可、plotNumber外部キー）
 */
export const BURIED_PERSON_FIELDS: FieldDef[] = [
  {
    path: 'plotNumber',
    label: '区画番号',
    type: 'string',
    required: true,
    maxLength: 50,
    description: 'メインシートの区画番号と一致させる',
    columnWidth: 15,
    example: 'A-001',
  },
  {
    path: 'name',
    label: '氏名',
    type: 'string',
    required: true,
    maxLength: 100,
    columnWidth: 15,
  },
  {
    path: 'nameKana',
    label: '氏名カナ',
    type: 'string',
    maxLength: 100,
    columnWidth: 18,
  },
  {
    path: 'relationship',
    label: '続柄',
    type: 'string',
    maxLength: 50,
    columnWidth: 10,
  },
  {
    path: 'birthDate',
    label: '生年月日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'deathDate',
    label: '死亡日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'age',
    label: '享年',
    type: 'integer',
    min: 0,
    columnWidth: 8,
  },
  {
    path: 'gender',
    label: '性別',
    type: 'enum',
    enumValues: ['male', 'female', 'other'],
    description: 'male / female / other',
    columnWidth: 8,
  },
  {
    path: 'burialDate',
    label: '納骨日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'posthumousName',
    label: '戒名',
    type: 'string',
    maxLength: 100,
    columnWidth: 18,
  },
  {
    path: 'reportDate',
    label: '届出日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'religion',
    label: '宗派',
    type: 'string',
    maxLength: 100,
    columnWidth: 12,
  },
  {
    path: 'notes',
    label: '備考',
    type: 'string',
    maxLength: 1000,
    columnWidth: 25,
  },
];

/**
 * 工事情報シート（1区画に複数行可、plotNumber外部キー）
 */
export const CONSTRUCTION_INFO_FIELDS: FieldDef[] = [
  {
    path: 'plotNumber',
    label: '区画番号',
    type: 'string',
    required: true,
    maxLength: 50,
    description: 'メインシートの区画番号と一致させる',
    columnWidth: 15,
    example: 'A-001',
  },
  {
    path: 'constructionType',
    label: '工事種別',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'startDate',
    label: '着工日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'completionDate',
    label: '完工日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'contractor',
    label: '施工業者',
    type: 'string',
    maxLength: 100,
    columnWidth: 15,
  },
  {
    path: 'supervisor',
    label: '現場監督',
    type: 'string',
    maxLength: 100,
    columnWidth: 15,
  },
  {
    path: 'progress',
    label: '進捗',
    type: 'string',
    maxLength: 100,
    columnWidth: 12,
  },
  {
    path: 'workItem1',
    label: '工事項目1',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'workDate1',
    label: '工事日1',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'workAmount1',
    label: '工事金額1',
    type: 'integer',
    min: 0,
    columnWidth: 12,
  },
  {
    path: 'workStatus1',
    label: '工事状態1',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'workItem2',
    label: '工事項目2',
    type: 'string',
    maxLength: 100,
    columnWidth: 14,
  },
  {
    path: 'workDate2',
    label: '工事日2',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'workAmount2',
    label: '工事金額2',
    type: 'integer',
    min: 0,
    columnWidth: 12,
  },
  {
    path: 'workStatus2',
    label: '工事状態2',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'permitNumber',
    label: '許可番号',
    type: 'string',
    maxLength: 50,
    columnWidth: 14,
  },
  {
    path: 'applicationDate',
    label: '申請日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'permitDate',
    label: '許可日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'permitStatus',
    label: '許可状態',
    type: 'string',
    maxLength: 50,
    columnWidth: 12,
  },
  {
    path: 'constructionContent',
    label: '工事内容',
    type: 'string',
    maxLength: 2000,
    columnWidth: 30,
  },
  {
    path: 'scheduledEndDate',
    label: '終了予定日',
    type: 'date',
    columnWidth: 13,
  },
  {
    path: 'notes',
    label: '備考',
    type: 'string',
    maxLength: 2000,
    columnWidth: 25,
  },
];

/**
 * シート名定義
 */
export const SHEET_NAMES = {
  MAIN: '区画情報',
  FAMILY_CONTACTS: '家族連絡先',
  BURIED_PERSONS: '埋葬者',
  CONSTRUCTION_INFOS: '工事情報',
} as const;

/**
 * シート構成
 */
export const SHEETS = [
  { name: SHEET_NAMES.MAIN, fields: MAIN_SHEET_FIELDS, multiRow: false },
  { name: SHEET_NAMES.FAMILY_CONTACTS, fields: FAMILY_CONTACT_FIELDS, multiRow: true },
  { name: SHEET_NAMES.BURIED_PERSONS, fields: BURIED_PERSON_FIELDS, multiRow: true },
  { name: SHEET_NAMES.CONSTRUCTION_INFOS, fields: CONSTRUCTION_INFO_FIELDS, multiRow: true },
] as const;

/**
 * 最大件数
 */
export const MAX_PLOTS_PER_BATCH = 500;
export const MAX_STAFF_PER_BATCH = 100;
