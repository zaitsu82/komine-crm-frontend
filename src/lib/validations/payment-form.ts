/**
 * 入金 (Payment) フォームバリデーション
 *
 * バックエンド `src/validations/paymentValidation.ts` と整合。
 * billingId / customerId / contractPlotId のいずれかは必須（孤児入金対応）。
 */

import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で入力してください')
  .optional()
  .or(z.literal(''));

const optionalUuid = z.string().uuid().optional().nullable().or(z.literal(''));

export const paymentFormSchema = z
  .object({
    billingId: optionalUuid,
    customerId: optionalUuid,
    contractPlotId: optionalUuid,
    scheduledDate: dateString,
    scheduledAmount: z.number().int().nonnegative('入金予定額は 0 円以上で入力してください').optional().nullable(),
    paymentDate: dateString,
    paymentAmount: z.number().int().nonnegative('入金額は 0 円以上で入力してください'),
    feeType: z.string().max(50, '料金種別は 50 文字以内で入力してください').optional().nullable().or(z.literal('')),
    applicationType: z.number().int().optional().nullable(),
    billingType: z.number().int().optional().nullable(),
    staffInCharge: z.string().max(100, '担当者は 100 文字以内で入力してください').optional().nullable().or(z.literal('')),
    notes: z.string().max(2000, '備考は 2000 文字以内で入力してください').optional().nullable().or(z.literal('')),
  })
  .refine(
    (v) => Boolean(v.billingId) || Boolean(v.customerId) || Boolean(v.contractPlotId),
    {
      message: '請求・顧客・区画のいずれかは紐付けてください',
      path: ['billingId'],
    }
  );

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const DEFAULT_PAYMENT_FORM_VALUES: PaymentFormValues = {
  billingId: '',
  customerId: '',
  contractPlotId: '',
  scheduledDate: '',
  scheduledAmount: null,
  paymentDate: '',
  paymentAmount: 0,
  feeType: '',
  applicationType: null,
  billingType: null,
  staffInCharge: '',
  notes: '',
};
