export interface CustomerDocument {
  id: string;
  type: 'invoice' | 'postcard' | 'other';
  name: string;
  createdAt: Date;
  url?: string;
  status: 'generated' | 'sent';
}

export interface Customer {
  id: string;

  // 顧客基本情報
  customerCode: string; // 墓石コード A-56など *必須
  plotNumber?: string; // 許可番号 例: A-56
  plotPeriod?: string; // 区画の期（1期〜4期）
  section?: string; // 区画詳細（期ごとのサブ区画: A〜P, 吉相, 1〜8, 10,11,樹林,天空K, るり庵テラス等）

  // 申込者情報
  applicantInfo?: {
    applicationDate: Date | null; // 申込日
    staffName: string; // 担当者氏名
    name: string; // 氏名
    nameKana: string; // 振り仮名（ひらがな）
    postalCode: string; // 郵便番号 例: 123-4567
    phoneNumber: string; // 電話番号 例: 090-1234-5678
    address: string; // 住所
  };

  // 契約者情報
  reservationDate: Date | null; // 予約日
  acceptanceNumber?: string; // 承諾書番号
  permitDate: Date | null; // 許可日
  startDate: Date | null; // 開始年月日
  name: string; // 氏名 *必須
  nameKana: string; // 振り仮名（ひらがな） *必須
  birthDate: Date | null; // 生年月日
  gender: 'male' | 'female' | undefined; // 性別 *必須
  phoneNumber: string; // 電話番号 *必須 例: 090-1234-5678
  faxNumber?: string; // ファックス 例: 03-1234-5678
  email?: string; // メール 例: example@email.com
  address: string; // 住所 *必須
  registeredAddress?: string; // 本籍地住所

  // 使用料
  usageFee?: {
    calculationType: string; // 計算区分 (セレクトボックス)
    taxType: string; // 税区分 (セレクトボックス)
    billingType: string; // 請求区分 (セレクトボックス)
    billingYears: string; // 請求年数
    area: string; // 面積 例: 10㎡
    unitPrice: string; // 単価 例: 10000
    usageFee: string; // 使用料 例: 200000
    paymentMethod: string; // 支払い方法 (セレクトボックス)
  };

  // 管理料
  managementFee?: {
    calculationType: string; // 計算区分 (セレクトボックス)
    taxType: string; // 税区分 (セレクトボックス)  
    billingType: string; // 請求区分 (セレクトボックス)
    billingYears: string; // 請求年数
    area: string; // 面積 例: 10㎡
    billingMonth: string; // 請求月 (1-12)
    managementFee: string; // 管理料 例: 5000
    unitPrice: string; // 単価 例: 500
    lastBillingMonth: string; // 最終請求月 ----年--月
    paymentMethod: string; // 支払方法 (セレクトボックス)
  };

  // 墓石
  gravestoneInfo?: {
    gravestoneBase: string; // 墓石台
    enclosurePosition: string; // 包囲位置
    gravestoneDealer: string; // 墓石取扱い
    gravestoneType: string; // 墓石タイプ
    surroundingArea: string; // 周辺設備
    establishmentDeadline: Date | null; // 設立期限
    establishmentDate: Date | null; // 設立日
  };

  // 家族・連絡先（複数対応） - 後方互換性のため残す
  familyContacts?: {
    id: string;
    name: string; // 氏名
    birthDate: Date | null; // 生年月日
    relationship: string; // 続柄
    address: string; // 住所
    phoneNumber: string; // 電話番号
    faxNumber?: string; // ファックス
    email?: string; // イーメール
    registeredAddress?: string; // 本籍住所
    mailingType: 'home' | 'work' | 'other' | undefined; // 送付先区分（初期状態は未選択）
    companyName?: string; // 勤務先名称
    companyNameKana?: string; // 勤務先かな
    companyAddress?: string; // 勤務先住所
    companyPhone?: string; // 勤務先電話番号
    notes?: string; // 備考
  }[];

  // 緊急連絡先（後方互換性のため残す）
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  } | null;

  // 埋葬者一覧（複数対応） - 後方互換性のため残す
  buriedPersons?: {
    id: string;
    name: string; // 氏名
    nameKana?: string; // 氏名カナ
    relationship?: string; // 続柄
    deathDate?: Date | null; // 死亡日
    age?: number; // 年齢
    gender: 'male' | 'female' | undefined; // 性別（初期状態は未選択）
    burialDate?: Date | null; // 埋葬日（後方互換性のため残す）
    memo?: string; // メモ（後方互換性のため残す）
  }[];

  // 合祀情報（複数の故人を一つの墓所に祀る管理）
  collectiveBurialInfo?: {
    id: string;
    type: 'family' | 'relative' | 'other'; // 合祀種別（家族・親族・その他）
    ceremonies: {
      id: string;
      date: Date | null; // 合祀実施日
      officiant: string; // 導師・執行者
      religion: string; // 宗派
      participants: number; // 参列者数
      location: string; // 実施場所
      memo?: string; // 備考
    }[];
    persons: {
      id: string;
      name: string; // 故人氏名
      nameKana: string; // 故人氏名カナ
      relationship: string; // 続柄
      deathDate: Date | null; // 死亡日
      age?: number; // 享年
      gender: 'male' | 'female' | undefined; // 性別
      originalPlotNumber?: string; // 元の墓所・区画番号
      transferDate?: Date | null; // 移転日
      certificateNumber?: string; // 改葬許可証番号
      memo?: string; // 備考
    }[];
    mainRepresentative: string; // 主たる代表者（契約者との関係）
    totalFee?: number; // 合祀料金総額
    documents?: {
      id: string;
      type: 'permit' | 'certificate' | 'agreement' | 'other'; // 書類種別
      name: string; // 書類名
      issuedDate?: Date | null; // 発行日
      expiryDate?: Date | null; // 有効期限
      memo?: string; // 備考
    }[];
    specialRequests?: string; // 特別な要望・配慮事項（宗教的配慮含む）
    status: 'planned' | 'completed' | 'cancelled'; // 実施状況
    createdAt: Date;
    updatedAt: Date;
  }[];

  // 勤務先・連絡情報 - 後方互換性のため残す
  workInfo?: {
    companyName: string; // 勤務先名称
    companyNameKana: string; // 勤務先仮名
    workAddress: string; // 就職先住所
    workPostalCode: string; // 郵便番号
    workPhoneNumber: string; // 電話番号
    dmSetting: 'allow' | 'deny' | 'limited'; // DM設定
    addressType: 'home' | 'work' | 'other'; // 宛先区分
    notes: string; // 備考
    zipCode?: string; // 郵便番号（別名）
    phone?: string; // 電話番号（別名）
    address?: string; // 住所（別名）
  };

  // 請求情報 - 後方互換性のため残す
  billingInfo?: {
    billingType: 'individual' | 'corporate' | 'bank_transfer'; // 請求種別
    bankName: string; // 銀行名称
    branchName: string; // 支店名称
    accountType: 'ordinary' | 'current' | 'savings'; // 口座科目
    accountNumber: string; // 記号番号
    accountHolder: string; // 口座名義
    type?: string; // 請求タイプ（表示用）
  };

  // 墓地区画情報 - 後方互換性のため残す
  plotInfo?: {
    plotNumber: string; // 区画番号
    section: string; // 区域
    usage: 'in_use' | 'available' | 'reserved'; // 利用状況
    size: string; // 面積
    price: string; // 金額
    contractDate: Date | null; // 契約日
    capacity?: number; // 収容人数
  } | null;

  // 複数区画管理（新規）
  // 1区画 = 3.6㎡、必要に応じて1.8㎡×2に分割販売
  // 複数区画の同一顧客所有（合わせ技）に対応
  ownedPlots?: OwnedPlot[];

  // 区画割当情報（新規）- 複数区画対応
  plotAssignments?: CustomerPlotAssignment[];
  documents?: CustomerDocument[];

  // システム情報
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive'; // 契約ステータス

  // 後方互換性のため残すフィールド
  postalCode?: string;
  prefecture?: string;
  city?: string;

  // 追加プロパティ（コンポーネントで使用）
  contractorInfo?: {
    contractYear?: number; // 契約年
    contractDate?: Date | null; // 契約日
    startDate?: Date | null; // 開始日
  };

  dmInfo?: {
    setting: 'allow' | 'deny' | 'limited'; // DM設定
    lastSentDate?: Date | null; // 最終送付日
    addressType?: 'home' | 'work' | 'other'; // 宛先区分
    notes?: string; // 備考
  };

  constructionInfo?: {
    constructionType?: string; // 工事種別
    constructionDate?: Date | null; // 工事日
    completionDate?: Date | null; // 完了日
    contractor?: string; // 施工業者
    constructionStatus?: string; // 工事ステータス
    notes?: string; // 備考
    // 墓石工事関連
    gravestoneType?: string; // 墓石タイプ
    gravestoneDealer?: string; // 墓石業者
    gravestoneStatus?: string; // 墓石ステータス
    // 外柵工事関連
    enclosureType?: string; // 外柵タイプ
    enclosureDealer?: string; // 外柵業者
    enclosureStatus?: string; // 外柵ステータス
    // 付帯工事関連
    additionalWorkType?: string; // 付帯工事種別
    additionalWorkDealer?: string; // 付帯工事業者
    additionalWorkStatus?: string; // 付帯工事ステータス
    // 工事履歴関連
    historyDate?: Date | null; // 履歴日
    historyType?: string; // 履歴種別
    historyContent?: string; // 履歴内容
    historyStaff?: string; // 担当者
    // 工事日程・金額関連
    startDate?: Date | null; // 開始日
    workDate1?: Date | null; // 工事日1
    workDate2?: Date | null; // 工事日2
    workAmount1?: number; // 工事金額1
    workAmount2?: number; // 工事金額2
    applicationDate?: Date | null; // 申請日
    permitDate?: Date | null; // 許可日
    paymentAmount1?: number; // 入金額1
    paymentAmount2?: number; // 入金額2
    paymentDate1?: Date | null; // 入金日1
    paymentScheduledDate2?: Date | null; // 入金予定日2
  };

  applicant?: string; // 申込者名（台帳表示用）

  managementFeeInfo?: {
    nextBillingDate?: Date | null; // 次回請求日
    lastBillingDate?: Date | null; // 前回請求日
    lastBillingMonth?: string; // 最終請求月
    amount?: number; // 金額
    managementFee?: string; // 管理料
    billingType?: string; // 請求区分
  };

  notes?: string; // 備考
  attentionNotes?: string; // 注意事項

  // 入金履歴
  paymentHistory?: {
    id: string;
    date: Date | null; // 入金日
    amount: number; // 金額
    item?: string; // 項目
    method?: string; // 支払方法
    status?: string; // 状況
    notes?: string; // 備考
  }[];
}

// 区画の期（1期〜4期）
export type PlotPeriod = '1期' | '2期' | '3期' | '4期';

// 期ごとの区画詳細オプション
export const PLOT_SECTIONS_BY_PERIOD: Record<PlotPeriod, string[]> = {
  '1期': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', '吉相'],
  '2期': ['1', '2', '3', '4', '5', '6', '7', '8'],
  '3期': ['10', '11', '樹林', '天空K'],
  '4期': ['るり庵テラス', '1.5', '2.4', '3', '4', '5', '8.4', '憩', '恵', 'るり庵Ⅱ'],
};

// 期の表示名マッピング
export const PLOT_PERIOD_LABELS: Record<PlotPeriod, string> = {
  '1期': '第1期',
  '2期': '第2期',
  '3期': '第3期',
  '4期': '第4期',
};

// ===== 区画管理仕様 =====
// 基本ルール: 1区画 = 3.6㎡、必要に応じて1.8㎡×2に分割販売
// 複数区画の同一顧客所有（合わせ技）に対応

// 区画サイズ定数
export const PLOT_SIZE = {
  FULL: 3.6, // 1区画 = 3.6㎡
  HALF: 1.8, // 半区画 = 1.8㎡
} as const;

// 区画サイズタイプ
export type PlotSizeType = 'full' | 'half';

// 区画サイズの表示名マッピング
export const PLOT_SIZE_LABELS: Record<PlotSizeType, string> = {
  full: '1区画（3.6㎡）',
  half: '半区画（1.8㎡）',
};

// 所有区画情報
export interface OwnedPlot {
  id: string;
  plotNumber: string; // 区画番号（例: C-29）
  plotPeriod?: PlotPeriod; // 期（1期〜4期）
  section?: string; // 区画詳細
  sizeType: PlotSizeType; // full: 3.6㎡, half: 1.8㎡
  areaSqm: number; // 面積（㎡）
  purchaseDate?: Date | null; // 購入日
  price?: number; // 購入金額
  status: 'in_use' | 'available' | 'reserved'; // 利用状況
  notes?: string; // 備考
}

// 顧客の所有区画情報を集計するヘルパー関数の型
export interface OwnedPlotsInfo {
  totalAreaSqm: number; // 合計面積
  plotCount: number; // 区画数
  plotNumbers: string[]; // 区画番号一覧
  displayText: string; // 表示用テキスト（例: "3.6㎡（C-29／C-30）"）
}

// 台帳表示用の契約ステータス型
export type ContractStatus = 'active' | 'attention' | 'overdue';

// ステータス表示情報
export interface CustomerStatusDisplay {
  status: ContractStatus;
  label: string;
  icon: string;
  className: string;
}

// あいう順タブ定義
export interface AiueoTab {
  key: string;
  label: string;
  shortLabel: string;
}

// 台帳フィルター設定
export interface RegistryFilter {
  searchQuery: string;
  aiueoTab: string;
  statusFilter?: ContractStatus[];
}

// ===== 区画・ユニット管理型定義 =====

// ユニット種別（墓地区画・納骨堂・合葬墓等）
export type PlotUnitType = 'grave_site' | 'columbarium' | 'ossuary' | 'other';

// ユニット種別の表示名マッピング
export const PLOT_UNIT_TYPE_LABELS: Record<PlotUnitType, string> = {
  grave_site: '墓地区画',
  columbarium: '納骨堂',
  ossuary: '合葬墓',
  other: 'その他',
};

// 区画ステータス（API仕様書準拠）
export type PlotStatus = 'in_use' | 'available' | 'reserved';

// 区画ステータスの表示名マッピング
export const PLOT_STATUS_LABELS: Record<PlotStatus, string> = {
  in_use: '使用中',
  available: '空き',
  reserved: '予約済み',
};

// 所有形態（exclusive: 独占, shared: 共同）
export type OwnershipType = 'exclusive' | 'shared';

// 所有形態の表示名マッピング
export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  exclusive: '独占',
  shared: '共同',
};

// 区画・納骨堂ユニット（マスタデータ）
export interface PlotUnit {
  id: string;
  plotNumber: string; // 区画番号（API仕様書のplotNumberに対応）
  section: string; // 区域（東区、西区など）
  type: PlotUnitType; // ユニット種別
  areaSqm?: number; // 面積（平方メートル）
  baseCapacity: number; // 基本収容人数（既定値）
  allowGoushi: boolean; // 合祀可否フラグ
  basePrice?: number; // 基本価格
  currentStatus: PlotStatus; // 現在のステータス
  notes?: string; // 備考
  createdAt: Date;
  updatedAt: Date;
}

// 顧客への区画割当情報
export interface CustomerPlotAssignment {
  id: string;
  customerId?: string; // 割当先の顧客ID（保存後に設定）

  // 既存ユニットを参照する場合
  plotNumber?: string; // 区画番号（PlotUnit.plotNumberを参照）

  // 新規ユニット（ドラフト）の場合
  draftUnit?: {
    section: string;
    type: PlotUnitType;
    areaSqm?: number;
    baseCapacity: number;
    allowGoushi: boolean;
    basePrice?: number;
    notes?: string;
  };

  // 収容人数設定
  capacityOverride?: number; // 収容人数の上書き（未設定時はbaseCapacityを使用）
  effectiveCapacity: number; // 有効な収容人数（capacityOverride ?? baseCapacity）

  // 合祀設定
  allowGoushi: boolean; // この割当での合祀可否（ユニットの設定を継承可能）

  // 所有・契約情報
  ownership: OwnershipType; // 所有形態
  purchaseDate: Date | null; // 購入日
  price?: number; // 実際の購入価格

  // 連携ステータス（保存時に区画管理システムへ送信）
  desiredStatus: PlotStatus; // 希望ステータス（reserved または in_use）

  // その他
  notes?: string; // 備考

  // システム情報
  createdAt: Date;
  updatedAt: Date;
}

// 区画割当のバリデーション結果
export interface PlotAssignmentValidation {
  isValid: boolean;
  errors: string[]; // エラーメッセージ
  warnings: string[]; // 警告メッセージ（ブロックはしない）
}

// 区画在庫確認結果
export interface PlotAvailabilityCheck {
  plotNumber: string;
  isAvailable: boolean;
  currentStatus: PlotStatus;
  conflictingCustomers?: string[]; // 競合する顧客のID一覧
  message?: string; // 警告メッセージ
}