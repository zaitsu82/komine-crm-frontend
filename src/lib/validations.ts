import { z } from "zod";

export const customerFormSchema = z.object({
  // 顧客基本情報
  customerCode: z.string().min(1, "墓石コードは必須です"),
  plotNumber: z.string().optional(),
  plotPeriod: z.string().optional(), // 区画の期（1期〜4期）
  section: z.string().optional(),

  // 契約者情報
  reservationDate: z.string().optional(),
  acceptanceNumber: z.string().optional(),
  permitDate: z.string().optional(),
  startDate: z.string().optional(),
  name: z.string().min(1, "氏名は必須です"),
  nameKana: z.string().min(1, "振り仮名は必須です"),
  birthDate: z.string().optional(),
  gender: z.enum(["", "male", "female"]).refine((val) => val !== "", {
    message: "性別を選択してください",
  }),
  phoneNumber: z.string().min(1, "電話番号は必須です"),
  faxNumber: z.string().optional(),
  email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  address: z.string().min(1, "住所は必須です"),
  registeredAddress: z.string().optional(),

  // 申込者情報
  applicantInfo: z.object({
    applicationDate: z.string().optional(),
    staffName: z.string().optional(),
    name: z.string().optional(),
    nameKana: z.string().optional(),
    postalCode: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
  }).optional(),

  // 勤務先・連絡情報
  workInfo: z.object({
    companyName: z.string().optional(),
    companyNameKana: z.string().optional(),
    workAddress: z.string().optional(),
    workPostalCode: z.string().optional(),
    workPhoneNumber: z.string().optional(),
    dmSetting: z.enum(["allow", "deny", "limited"]).optional(),
    addressType: z.enum(["home", "work", "other"]).optional(),
    notes: z.string().optional(),
  }).optional(),

  // 請求情報
  billingInfo: z.object({
    billingType: z.enum(["individual", "corporate", "bank_transfer"]).optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    accountType: z.enum(["ordinary", "current", "savings"]).optional(),
    accountNumber: z.string().optional(),
    accountHolder: z.string().optional(),
  }).optional(),

  // 契約者情報
  contractorInfo: z.object({
    reservationDate: z.string().optional(),
    acceptanceNumber: z.string().optional(),
    permitDate: z.string().optional(),
    startDate: z.string().optional(),
    registeredAddress: z.string().optional(),
  }).optional(),

  // 使用料
  usageFee: z.object({
    calculationType: z.string().optional(),
    taxType: z.string().optional(),
    billingType: z.string().optional(),
    billingYears: z.string().optional(),
    area: z.string().optional(),
    unitPrice: z.string().optional(),
    usageFee: z.string().optional(),
    paymentMethod: z.string().optional(),
  }).optional(),

  // 管理料
  managementFee: z.object({
    calculationType: z.string().optional(),
    taxType: z.string().optional(),
    billingType: z.string().optional(),
    billingYears: z.string().optional(),
    area: z.string().optional(),
    billingMonth: z.string().optional(),
    managementFee: z.string().optional(),
    unitPrice: z.string().optional(),
    lastBillingMonth: z.string().optional(),
    paymentMethod: z.string().optional(),
  }).optional(),

  // 墓石情報
  gravestoneInfo: z.object({
    gravestoneBase: z.string().optional(),
    enclosurePosition: z.string().optional(),
    gravestoneDealer: z.string().optional(),
    gravestoneType: z.string().optional(),
    surroundingArea: z.string().optional(),
    establishmentDeadline: z.string().optional(),
    establishmentDate: z.string().optional(),
  }).optional(),

  // 家族・連絡先（複数対応）
  familyContacts: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "氏名は必須です"),
    birthDate: z.string().optional(),
    relationship: z.string().min(1, "続柄は必須です"),
    address: z.string().min(1, "住所は必須です"),
    phoneNumber: z.string().min(1, "電話番号は必須です"),
    faxNumber: z.string().optional(),
    email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
    registeredAddress: z.string().optional(),
    mailingType: z.enum(["", "home", "work", "other"]),
    companyName: z.string().optional(),
    companyNameKana: z.string().optional(),
    companyAddress: z.string().optional(),
    companyPhone: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),

  emergencyContact: z.object({
    name: z.string().min(1, "緊急連絡先の氏名は必須です"),
    relationship: z.string().min(1, "続柄は必須です"),
    phoneNumber: z.string().min(1, "緊急連絡先の電話番号は必須です"),
  }).optional(),

  // 埋葬者一覧（複数対応）
  buriedPersons: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "氏名は必須です"),
    gender: z.enum(["", "male", "female"]),
    burialDate: z.string().min(1, "埋葬日は必須です"),
    memo: z.string().optional(),
  })).optional(),

  plotInfo: z.object({
    plotNumber: z.string().optional(),
    section: z.string().optional(),
    usage: z.enum(["in_use", "available", "reserved"]).optional(),
    size: z.string().optional(),
    price: z.string().optional(),
    contractDate: z.string().optional(),
  }).optional(),

  // 後方互換性のため残すフィールド
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

export const collectiveBurialApplicationSchema = z.object({
  applicationDate: z.string().min(1, '申込日は必須です'),
  desiredDate: z.string().optional(),
  burialType: z.enum(['family', 'relative', 'other'], {
    message: '合祀種別を選択してください'
  }),
  mainRepresentative: z.string().min(1, '主たる代表者は必須です'),
  applicantName: z.string().min(1, '申込者氏名は必須です'),
  applicantNameKana: z.string().min(1, '申込者氏名（カナ）は必須です'),
  applicantPhone: z.string().min(1, '連絡先電話番号は必須です'),
  applicantEmail: z.string().email('正しいメールアドレスを入力してください').optional().or(z.literal('')),
  applicantPostalCode: z.string().optional(),
  applicantAddress: z.string().min(1, '住所は必須です'),
  plotSection: z.string().min(1, '区域は必須です'),
  plotNumber: z.string().min(1, '許可番号は必須です'),
  specialRequests: z.string().optional(),
  totalFee: z.string().optional(),
  depositAmount: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentDueDate: z.string().optional(),
  persons: z.array(z.object({
    name: z.string().min(1, '氏名は必須です'),
    nameKana: z.string().min(1, '氏名（カナ）は必須です'),
    relationship: z.string().min(1, '続柄は必須です'),
    deathDate: z.string().min(1, '死亡日は必須です'),
    age: z.string().optional(),
    gender: z.enum(['', 'male', 'female']).optional(),
    originalPlotNumber: z.string().optional(),
    certificateNumber: z.string().optional(),
    memo: z.string().optional(),
  })).min(1, '合祀対象者を1名以上登録してください'),
  ceremonies: z.array(z.object({
    date: z.string().optional(),
    officiant: z.string().optional(),
    religion: z.string().optional(),
    participants: z.string().optional(),
    location: z.string().optional(),
    memo: z.string().optional(),
  })).optional(),
  documents: z.array(z.object({
    type: z.enum(['permit', 'certificate', 'agreement', 'other'], {
      message: '書類種別を選択してください'
    }),
    name: z.string().min(1, '書類名は必須です'),
    issuedDate: z.string().optional(),
    memo: z.string().optional(),
  })).optional(),
});

export type CollectiveBurialApplicationFormValues = z.infer<typeof collectiveBurialApplicationSchema>;

// ===== 区画割当バリデーション =====

// 区画割当の基本スキーマ
export const plotAssignmentSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),

  // 既存ユニット参照 or 新規ドラフト（どちらか必須）
  plotNumber: z.string().optional(),
  draftUnit: z.object({
    section: z.string().min(1, "区域は必須です"),
    type: z.enum(['grave_site', 'columbarium', 'ossuary', 'other'], {
      message: "ユニット種別を選択してください"
    }),
    areaSqm: z.number().positive("面積は正の数値である必要があります").optional(),
    baseCapacity: z.number()
      .int("収容人数は整数である必要があります")
      .min(1, "収容人数は1人以上である必要があります")
      .max(50, "収容人数は50人以下である必要があります"),
    allowGoushi: z.boolean(),
    basePrice: z.number().nonnegative("価格は0以上である必要があります").optional(),
    notes: z.string().optional(),
  }).optional(),

  // 収容人数設定
  capacityOverride: z.number()
    .int("収容人数は整数である必要があります")
    .min(1, "収容人数は1人以上である必要があります")
    .max(50, "収容人数は50人以下である必要があります")
    .optional(),
  effectiveCapacity: z.number()
    .int("収容人数は整数である必要があります")
    .min(1, "有効な収容人数は1人以上である必要があります"),

  // 合祀設定
  allowGoushi: z.boolean(),

  // 所有・契約情報
  ownership: z.enum(['exclusive', 'shared'], {
    message: "所有形態を選択してください"
  }),
  purchaseDate: z.string().optional(),
  price: z.number().nonnegative("価格は0以上である必要があります").optional(),

  // 連携ステータス
  desiredStatus: z.enum(['reserved', 'in_use'], {
    message: "ステータスを選択してください"
  }),

  // その他
  notes: z.string().optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).refine(
  (data) => data.plotNumber || data.draftUnit,
  {
    message: "既存区画の選択または新規区画の情報が必要です",
    path: ["plotNumber"],
  }
);

// 顧客フォームに区画割当を追加したスキーマ
export const customerFormWithPlotsSchema = customerFormSchema.extend({
  plotAssignments: z.array(plotAssignmentSchema).optional(),
});

export type PlotAssignmentFormData = z.infer<typeof plotAssignmentSchema>;
export type CustomerFormWithPlotsData = z.infer<typeof customerFormWithPlotsSchema>;
