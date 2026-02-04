/**
 * 区画フォームバリデーション
 *
 * @komine/types の CreatePlotRequest / UpdatePlotRequest に対応
 * 型変換なしでAPIリクエストを生成できる構造
 */

import { z } from 'zod';
import {
  Gender,
  ContractRole,
  PaymentStatus,
  DmSetting,
  AddressType,
  BillingType,
  AccountType,
} from '@komine/types';

// ===== 共通バリデーション =====

// 日付文字列（YYYY-MM-DD形式）
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください')
  .optional()
  .or(z.literal(''));

// 電話番号（ハイフンなし11桁）
const phoneNumber = z
  .string()
  .regex(/^\d{10,11}$/, '電話番号は10〜11桁の数字で入力してください');

// 郵便番号（ハイフンなし7桁）
const postalCode = z
  .string()
  .regex(/^\d{7}$/, '郵便番号は7桁の数字で入力してください');

// メールアドレス（オプショナル）
const optionalEmail = z
  .string()
  .email('正しいメールアドレスを入力してください')
  .optional()
  .or(z.literal(''));

// ===== 物理区画スキーマ =====

export const physicalPlotSchema = z.object({
  plotNumber: z.string().min(1, '区画番号は必須です'),
  areaName: z.string().min(1, '区画（期）は必須です'),
  areaSqm: z.coerce.number().positive('面積は正の数値で入力してください').default(3.6),
  notes: z.string().optional().nullable(),
});

// ===== 契約区画スキーマ =====

export const contractPlotSchema = z.object({
  contractAreaSqm: z.coerce.number().positive('契約面積は正の数値で入力してください'),
  locationDescription: z.string().optional().nullable(),
});

// ===== 販売契約スキーマ =====

export const saleContractSchema = z.object({
  contractDate: z.string().min(1, '契約日は必須です'),
  price: z.coerce.number().nonnegative('価格は0以上で入力してください'),
  paymentStatus: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.Unpaid),
  reservationDate: dateString,
  acceptanceNumber: z.string().optional(),
  permitDate: dateString,
  permitNumber: z.string().optional(),
  startDate: dateString,
  notes: z.string().optional().nullable(),
});

// ===== 顧客スキーマ =====

export const customerSchema = z.object({
  name: z.string().min(1, '氏名は必須です'),
  nameKana: z.string().min(1, '氏名カナは必須です'),
  birthDate: dateString.nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  postalCode: postalCode,
  address: z.string().min(1, '住所は必須です'),
  registeredAddress: z.string().optional().nullable(),
  phoneNumber: phoneNumber,
  faxNumber: z.string().optional().nullable(),
  email: optionalEmail.nullable(),
  notes: z.string().optional().nullable(),
  role: z.nativeEnum(ContractRole).optional().default(ContractRole.Contractor),
});

// ===== 勤務先情報スキーマ =====

export const workInfoSchema = z.object({
  companyName: z.string().min(1, '勤務先名称は必須です'),
  companyNameKana: z.string().optional().default(''),
  workAddress: z.string().optional().default(''),
  workPostalCode: z.string().optional().default(''),
  workPhoneNumber: z.string().optional().default(''),
  dmSetting: z.nativeEnum(DmSetting).optional().default(DmSetting.Allow),
  addressType: z.nativeEnum(AddressType).optional().default(AddressType.Home),
  notes: z.string().optional().nullable(),
});

// ===== 請求情報スキーマ =====

export const billingInfoSchema = z.object({
  billingType: z.nativeEnum(BillingType),
  bankName: z.string().min(1, '銀行名は必須です'),
  branchName: z.string().min(1, '支店名は必須です'),
  accountType: z.nativeEnum(AccountType),
  accountNumber: z.string().min(1, '口座番号は必須です'),
  accountHolder: z.string().min(1, '口座名義は必須です'),
});

// ===== 使用料スキーマ =====

export const usageFeeSchema = z.object({
  calculationType: z.string().optional().nullable(),
  taxType: z.string().optional().nullable(),
  billingType: z.string().optional().nullable(),
  billingYears: z.string().optional().nullable(),
  usageFee: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  unitPrice: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
});

// ===== 管理料スキーマ =====

export const managementFeeSchema = z.object({
  calculationType: z.string().optional().nullable(),
  taxType: z.string().optional().nullable(),
  billingType: z.string().optional().nullable(),
  billingYears: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  billingMonth: z.string().optional().nullable(),
  managementFee: z.string().optional().nullable(),
  unitPrice: z.string().optional().nullable(),
  lastBillingMonth: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
});

// ===== 墓石情報スキーマ =====

export const gravestoneInfoSchema = z.object({
  gravestoneBase: z.string().optional().nullable(),
  enclosurePosition: z.string().optional().nullable(),
  gravestoneDealer: z.string().optional().nullable(),
  gravestoneType: z.string().optional().nullable(),
  surroundingArea: z.string().optional().nullable(),
  establishmentDeadline: dateString.nullable(),
  establishmentDate: dateString.nullable(),
});

// ===== 家族連絡先スキーマ =====

export const familyContactSchema = z.object({
  id: z.string().optional(), // 既存レコードの場合はID付き
  emergencyContactFlag: z.boolean().optional().default(false),
  name: z.string().min(1, '氏名は必須です'),
  birthDate: dateString.nullable(),
  relationship: z.string().min(1, '続柄は必須です'),
  postalCode: z.string().optional().nullable(),
  address: z.string().min(1, '住所は必須です'),
  phoneNumber: z.string().min(1, '電話番号は必須です'),
  faxNumber: z.string().optional().nullable(),
  email: optionalEmail.nullable(),
  registeredAddress: z.string().optional().nullable(),
  mailingType: z.nativeEnum(AddressType).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ===== 埋葬者スキーマ =====

export const buriedPersonSchema = z.object({
  id: z.string().optional(), // 既存レコードの場合はID付き
  name: z.string().min(1, '氏名は必須です'),
  nameKana: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  deathDate: dateString.nullable(),
  age: z.coerce.number().int().nonnegative().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  burialDate: dateString.nullable(),
  notes: z.string().optional().nullable(),
});

// ===== 合祀情報スキーマ =====

export const collectiveBurialSchema = z.object({
  burialCapacity: z.coerce.number().int().positive('埋葬上限は1以上で入力してください'),
  validityPeriodYears: z.coerce.number().int().positive('有効期間は1年以上で入力してください'),
  billingAmount: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ===== メインフォームスキーマ（作成用） =====

export const plotFormSchema = z.object({
  // 物理区画（必須）
  physicalPlot: physicalPlotSchema,

  // 契約区画（必須）
  contractPlot: contractPlotSchema,

  // 販売契約（必須）
  saleContract: saleContractSchema,

  // 顧客情報（必須）
  customer: customerSchema,

  // オプショナルセクション
  workInfo: workInfoSchema.optional().nullable(),
  billingInfo: billingInfoSchema.optional().nullable(),
  usageFee: usageFeeSchema.optional().nullable(),
  managementFee: managementFeeSchema.optional().nullable(),
  gravestoneInfo: gravestoneInfoSchema.optional().nullable(),

  // 配列セクション
  familyContacts: z.array(familyContactSchema).optional(),
  buriedPersons: z.array(buriedPersonSchema).optional(),

  // 合祀情報
  collectiveBurial: collectiveBurialSchema.optional().nullable(),
});

// ===== メインフォームスキーマ（更新用） =====

export const plotUpdateFormSchema = z.object({
  // 物理区画の更新（notesのみ）
  physicalPlot: z.object({
    notes: z.string().optional().nullable(),
  }).optional(),

  // 契約区画
  contractPlot: contractPlotSchema.partial().optional(),

  // 販売契約
  saleContract: saleContractSchema.partial().optional(),

  // 顧客情報
  customer: customerSchema.partial().optional(),

  // オプショナルセクション
  workInfo: workInfoSchema.optional().nullable(),
  billingInfo: billingInfoSchema.optional().nullable(),
  usageFee: usageFeeSchema.optional().nullable(),
  managementFee: managementFeeSchema.optional().nullable(),
  gravestoneInfo: gravestoneInfoSchema.optional().nullable(),

  // 配列セクション（全置換）
  familyContacts: z.array(familyContactSchema).optional(),
  buriedPersons: z.array(buriedPersonSchema).optional(),

  // 合祀情報
  collectiveBurial: collectiveBurialSchema.optional().nullable(),
});

// ===== 型エクスポート =====

export type PhysicalPlotFormData = z.infer<typeof physicalPlotSchema>;
export type ContractPlotFormData = z.infer<typeof contractPlotSchema>;
export type SaleContractFormData = z.infer<typeof saleContractSchema>;
export type CustomerFormDataNew = z.infer<typeof customerSchema>;
export type WorkInfoFormData = z.infer<typeof workInfoSchema>;
export type BillingInfoFormData = z.infer<typeof billingInfoSchema>;
export type UsageFeeFormData = z.infer<typeof usageFeeSchema>;
export type ManagementFeeFormData = z.infer<typeof managementFeeSchema>;
export type GravestoneInfoFormData = z.infer<typeof gravestoneInfoSchema>;
export type FamilyContactFormData = z.infer<typeof familyContactSchema>;
export type BuriedPersonFormData = z.infer<typeof buriedPersonSchema>;
export type CollectiveBurialFormData = z.infer<typeof collectiveBurialSchema>;

export type PlotFormData = z.infer<typeof plotFormSchema>;
export type PlotUpdateFormData = z.infer<typeof plotUpdateFormSchema>;

// ===== デフォルト値 =====

export const defaultPhysicalPlot: PhysicalPlotFormData = {
  plotNumber: '',
  areaName: '',
  areaSqm: 3.6,
  notes: null,
};

export const defaultContractPlot: ContractPlotFormData = {
  contractAreaSqm: 3.6,
  locationDescription: null,
};

export const defaultSaleContract: SaleContractFormData = {
  contractDate: new Date().toISOString().split('T')[0],
  price: 0,
  paymentStatus: PaymentStatus.Unpaid,
  reservationDate: '',
  acceptanceNumber: '',
  permitDate: '',
  permitNumber: '',
  startDate: '',
  notes: null,
};

export const defaultCustomer: CustomerFormDataNew = {
  name: '',
  nameKana: '',
  birthDate: null,
  gender: null,
  postalCode: '',
  address: '',
  registeredAddress: null,
  phoneNumber: '',
  faxNumber: null,
  email: null,
  notes: null,
  role: ContractRole.Contractor,
};

export const defaultPlotFormData: PlotFormData = {
  physicalPlot: defaultPhysicalPlot,
  contractPlot: defaultContractPlot,
  saleContract: defaultSaleContract,
  customer: defaultCustomer,
  workInfo: null,
  billingInfo: null,
  usageFee: null,
  managementFee: null,
  gravestoneInfo: null,
  familyContacts: [],
  buriedPersons: [],
  collectiveBurial: null,
};

// ===== フォームデータ → APIリクエスト変換 =====

import type { CreatePlotRequest, UpdatePlotRequest } from '@komine/types';

/**
 * PlotFormData を CreatePlotRequest に変換
 * 型が一致しているため、ほぼそのまま使用可能
 */
export function plotFormDataToCreateRequest(formData: PlotFormData): CreatePlotRequest {
  return {
    physicalPlot: {
      plotNumber: formData.physicalPlot.plotNumber,
      areaName: formData.physicalPlot.areaName,
      areaSqm: formData.physicalPlot.areaSqm,
      notes: formData.physicalPlot.notes || undefined,
    },
    contractPlot: {
      contractAreaSqm: formData.contractPlot.contractAreaSqm,
      locationDescription: formData.contractPlot.locationDescription || undefined,
    },
    saleContract: {
      contractDate: formData.saleContract.contractDate,
      price: formData.saleContract.price,
      paymentStatus: formData.saleContract.paymentStatus,
      reservationDate: formData.saleContract.reservationDate || undefined,
      acceptanceNumber: formData.saleContract.acceptanceNumber || undefined,
      permitDate: formData.saleContract.permitDate || undefined,
      permitNumber: formData.saleContract.permitNumber || undefined,
      startDate: formData.saleContract.startDate || undefined,
      notes: formData.saleContract.notes || undefined,
    },
    customer: {
      name: formData.customer.name,
      nameKana: formData.customer.nameKana,
      birthDate: formData.customer.birthDate || undefined,
      gender: formData.customer.gender || undefined,
      postalCode: formData.customer.postalCode,
      address: formData.customer.address,
      registeredAddress: formData.customer.registeredAddress || undefined,
      phoneNumber: formData.customer.phoneNumber,
      faxNumber: formData.customer.faxNumber || undefined,
      email: formData.customer.email || undefined,
      notes: formData.customer.notes || undefined,
      role: formData.customer.role,
    },
    workInfo: formData.workInfo
      ? {
          companyName: formData.workInfo.companyName,
          companyNameKana: formData.workInfo.companyNameKana,
          workAddress: formData.workInfo.workAddress,
          workPostalCode: formData.workInfo.workPostalCode,
          workPhoneNumber: formData.workInfo.workPhoneNumber,
          dmSetting: formData.workInfo.dmSetting,
          addressType: formData.workInfo.addressType,
          notes: formData.workInfo.notes || undefined,
        }
      : undefined,
    billingInfo: formData.billingInfo
      ? {
          billingType: formData.billingInfo.billingType,
          bankName: formData.billingInfo.bankName,
          branchName: formData.billingInfo.branchName,
          accountType: formData.billingInfo.accountType,
          accountNumber: formData.billingInfo.accountNumber,
          accountHolder: formData.billingInfo.accountHolder,
        }
      : undefined,
    usageFee: formData.usageFee
      ? {
          calculationType: formData.usageFee.calculationType || undefined,
          taxType: formData.usageFee.taxType || undefined,
          billingType: formData.usageFee.billingType || undefined,
          billingYears: formData.usageFee.billingYears || undefined,
          usageFee: formData.usageFee.usageFee || undefined,
          area: formData.usageFee.area || undefined,
          unitPrice: formData.usageFee.unitPrice || undefined,
          paymentMethod: formData.usageFee.paymentMethod || undefined,
        }
      : undefined,
    managementFee: formData.managementFee
      ? {
          calculationType: formData.managementFee.calculationType || undefined,
          taxType: formData.managementFee.taxType || undefined,
          billingType: formData.managementFee.billingType || undefined,
          billingYears: formData.managementFee.billingYears || undefined,
          area: formData.managementFee.area || undefined,
          billingMonth: formData.managementFee.billingMonth || undefined,
          managementFee: formData.managementFee.managementFee || undefined,
          unitPrice: formData.managementFee.unitPrice || undefined,
          lastBillingMonth: formData.managementFee.lastBillingMonth || undefined,
          paymentMethod: formData.managementFee.paymentMethod || undefined,
        }
      : undefined,
    gravestoneInfo: formData.gravestoneInfo
      ? {
          gravestoneBase: formData.gravestoneInfo.gravestoneBase || undefined,
          enclosurePosition: formData.gravestoneInfo.enclosurePosition || undefined,
          gravestoneDealer: formData.gravestoneInfo.gravestoneDealer || undefined,
          gravestoneType: formData.gravestoneInfo.gravestoneType || undefined,
          surroundingArea: formData.gravestoneInfo.surroundingArea || undefined,
          establishmentDeadline: formData.gravestoneInfo.establishmentDeadline || undefined,
          establishmentDate: formData.gravestoneInfo.establishmentDate || undefined,
        }
      : undefined,
    familyContacts: formData.familyContacts?.map((fc) => ({
      emergencyContactFlag: fc.emergencyContactFlag,
      name: fc.name,
      birthDate: fc.birthDate || undefined,
      relationship: fc.relationship,
      postalCode: fc.postalCode || undefined,
      address: fc.address,
      phoneNumber: fc.phoneNumber,
      faxNumber: fc.faxNumber || undefined,
      email: fc.email || undefined,
      registeredAddress: fc.registeredAddress || undefined,
      mailingType: fc.mailingType || undefined,
      notes: fc.notes || undefined,
    })),
    buriedPersons: formData.buriedPersons?.map((bp) => ({
      name: bp.name,
      nameKana: bp.nameKana || undefined,
      relationship: bp.relationship || undefined,
      deathDate: bp.deathDate || undefined,
      age: bp.age || undefined,
      gender: bp.gender || undefined,
      burialDate: bp.burialDate || undefined,
      notes: bp.notes || undefined,
    })),
    collectiveBurial: formData.collectiveBurial
      ? {
          burialCapacity: formData.collectiveBurial.burialCapacity,
          validityPeriodYears: formData.collectiveBurial.validityPeriodYears,
          billingAmount: formData.collectiveBurial.billingAmount || undefined,
          notes: formData.collectiveBurial.notes || undefined,
        }
      : undefined,
  };
}

/**
 * PlotUpdateFormData を UpdatePlotRequest に変換
 */
export function plotFormDataToUpdateRequest(formData: PlotUpdateFormData): UpdatePlotRequest {
  const request: UpdatePlotRequest = {};

  if (formData.physicalPlot) {
    request.physicalPlot = {
      notes: formData.physicalPlot.notes || undefined,
    };
  }

  if (formData.contractPlot) {
    request.contractPlot = {
      contractAreaSqm: formData.contractPlot.contractAreaSqm,
      locationDescription: formData.contractPlot.locationDescription || undefined,
    };
  }

  if (formData.saleContract) {
    request.saleContract = {
      contractDate: formData.saleContract.contractDate,
      price: formData.saleContract.price,
      paymentStatus: formData.saleContract.paymentStatus,
      reservationDate: formData.saleContract.reservationDate || undefined,
      acceptanceNumber: formData.saleContract.acceptanceNumber || undefined,
      permitDate: formData.saleContract.permitDate || undefined,
      permitNumber: formData.saleContract.permitNumber || undefined,
      startDate: formData.saleContract.startDate || undefined,
      notes: formData.saleContract.notes || undefined,
    };
  }

  if (formData.customer) {
    request.customer = {
      name: formData.customer.name,
      nameKana: formData.customer.nameKana,
      birthDate: formData.customer.birthDate || undefined,
      gender: formData.customer.gender || undefined,
      postalCode: formData.customer.postalCode,
      address: formData.customer.address,
      registeredAddress: formData.customer.registeredAddress || undefined,
      phoneNumber: formData.customer.phoneNumber,
      faxNumber: formData.customer.faxNumber || undefined,
      email: formData.customer.email || undefined,
      notes: formData.customer.notes || undefined,
    };
  }

  // オプショナルセクション
  request.workInfo = formData.workInfo;
  request.billingInfo = formData.billingInfo;
  request.usageFee = formData.usageFee;
  request.managementFee = formData.managementFee;
  request.gravestoneInfo = formData.gravestoneInfo;

  // 配列セクション
  if (formData.familyContacts) {
    request.familyContacts = formData.familyContacts.map((fc) => ({
      id: fc.id,
      emergencyContactFlag: fc.emergencyContactFlag,
      name: fc.name,
      birthDate: fc.birthDate || undefined,
      relationship: fc.relationship,
      postalCode: fc.postalCode || undefined,
      address: fc.address,
      phoneNumber: fc.phoneNumber,
      faxNumber: fc.faxNumber || undefined,
      email: fc.email || undefined,
      registeredAddress: fc.registeredAddress || undefined,
      mailingType: fc.mailingType || undefined,
      notes: fc.notes || undefined,
    }));
  }

  if (formData.buriedPersons) {
    request.buriedPersons = formData.buriedPersons.map((bp) => ({
      id: bp.id,
      name: bp.name,
      nameKana: bp.nameKana || undefined,
      relationship: bp.relationship || undefined,
      deathDate: bp.deathDate || undefined,
      age: bp.age || undefined,
      gender: bp.gender || undefined,
      burialDate: bp.burialDate || undefined,
      notes: bp.notes || undefined,
    }));
  }

  request.collectiveBurial = formData.collectiveBurial;

  return request;
}
