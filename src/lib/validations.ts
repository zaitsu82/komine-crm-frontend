import { z } from "zod";

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

// ===== 合祀管理（API連携版）バリデーション =====

/**
 * 合祀管理フォーム（API連携版）
 * Prisma CollectiveBurialモデルに準拠
 *
 * 注意: z.coerce.number()を使用しているため、zodResolverとの組み合わせで
 * 型推論が正しく機能しない場合があります（@hookform/resolversの既知の制限）。
 * フォーム側で `as any` を使用して回避してください。
 */
export const collectiveBurialFormSchema = z.object({
  // 基本情報
  contractPlotId: z.string().min(1, '契約区画IDは必須です'),
  burialCapacity: z.coerce.number().min(1, '埋葬上限人数は1以上を指定してください').max(100, '埋葬上限人数は100以下を指定してください'),
  validityPeriodYears: z.coerce.number().min(1, '有効期間は1年以上を指定してください').max(100, '有効期間は100年以下を指定してください'),
  billingAmount: z.coerce.number().min(0, '請求金額は0以上を指定してください').optional().or(z.literal('')),

  // 合祀種別（notesに格納）
  burialType: z.enum(['family', 'relative', 'other']).optional(),

  // 特別な要望（notesに格納）
  specialRequests: z.string().optional(),

  // 自由記述備考（notesに格納）
  freeText: z.string().optional(),

  // 法要情報（notesに格納）
  ceremonies: z.array(z.object({
    date: z.string().optional(),
    officiant: z.string().optional(),
    religion: z.string().optional(),
    participants: z.coerce.number().optional(),
    location: z.string().optional(),
    memo: z.string().optional(),
  })).optional(),

  // 書類情報（notesに格納）
  documents: z.array(z.object({
    type: z.enum(['permit', 'certificate', 'agreement', 'other']),
    name: z.string().min(1, '書類名は必須です'),
    issuedDate: z.string().optional(),
    memo: z.string().optional(),
  })).optional(),
});

export type CollectiveBurialFormValues = z.infer<typeof collectiveBurialFormSchema>;

/**
 * 合祀管理更新フォーム（既存データ編集用）
 */
export const collectiveBurialUpdateFormSchema = z.object({
  burialCapacity: z.coerce.number().min(1, '埋葬上限人数は1以上を指定してください').max(100, '埋葬上限人数は100以下を指定してください').optional(),
  validityPeriodYears: z.coerce.number().min(1, '有効期間は1年以上を指定してください').max(100, '有効期間は100年以下を指定してください').optional(),
  billingAmount: z.coerce.number().min(0, '請求金額は0以上を指定してください').optional().nullable(),
  billingStatus: z.enum(['pending', 'billed', 'paid']).optional(),

  // 合祀種別（notesに格納）
  burialType: z.enum(['family', 'relative', 'other']).optional(),

  // 特別な要望（notesに格納）
  specialRequests: z.string().optional(),

  // 自由記述備考（notesに格納）
  freeText: z.string().optional(),

  // 法要情報（notesに格納）
  ceremonies: z.array(z.object({
    date: z.string().optional(),
    officiant: z.string().optional(),
    religion: z.string().optional(),
    participants: z.coerce.number().optional(),
    location: z.string().optional(),
    memo: z.string().optional(),
  })).optional(),

  // 書類情報（notesに格納）
  documents: z.array(z.object({
    type: z.enum(['permit', 'certificate', 'agreement', 'other']),
    name: z.string().min(1, '書類名は必須です'),
    issuedDate: z.string().optional(),
    memo: z.string().optional(),
  })).optional(),
});

export type CollectiveBurialUpdateFormValues = z.infer<typeof collectiveBurialUpdateFormSchema>;
