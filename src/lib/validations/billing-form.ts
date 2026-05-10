/**
 * 請求 (Billing) フォームバリデーション
 *
 * バックエンド `src/validations/billingValidation.ts` と整合。
 */

import { z } from 'zod';
import { BillingCategory, BillingRecordStatus } from '@komine/types';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で入力してください')
  .optional()
  .or(z.literal(''));

const optionalInt = (min?: number, max?: number) =>
  z
    .union([z.number().int(), z.literal('').transform(() => undefined), z.literal('').optional()])
    .optional()
    .nullable()
    .refine((v) => v === undefined || v === null || v === '' || (typeof v === 'number' && (min === undefined || v >= min) && (max === undefined || v <= max)), {
      message: `数値の範囲外です${min !== undefined ? ` (最小: ${min})` : ''}${max !== undefined ? ` (最大: ${max})` : ''}`,
    });

export const billingFormSchema = z.object({
  contractPlotId: z.string().uuid('契約区画 ID を選択してください'),
  customerId: z.string().uuid('顧客 ID を選択してください'),
  category: z.nativeEnum(BillingCategory),
  amount: z.number().int().nonnegative('金額は 0 円以上で入力してください'),
  useStartYear: optionalInt(1900, 2999),
  useEndYear: optionalInt(1900, 2999),
  targetMonth: optionalInt(1, 12),
  billingYears: optionalInt(1, 100),
  contractDate: dateString,
  billingDate: dateString,
  applicationType: optionalInt(),
  billingType: optionalInt(),
  status: z.nativeEnum(BillingRecordStatus).optional(),
  terminated: z.boolean().optional(),
  terminatedDate: dateString,
  notes: z.string().max(2000, '備考は 2000 文字以内で入力してください').optional().nullable().or(z.literal('')),
});

export type BillingFormValues = z.infer<typeof billingFormSchema>;

export const DEFAULT_BILLING_FORM_VALUES: BillingFormValues = {
  contractPlotId: '',
  customerId: '',
  category: BillingCategory.UsageFee,
  amount: 0,
  useStartYear: null,
  useEndYear: null,
  targetMonth: null,
  billingYears: null,
  contractDate: '',
  billingDate: '',
  applicationType: null,
  billingType: null,
  status: BillingRecordStatus.Pending,
  terminated: false,
  terminatedDate: '',
  notes: '',
};
