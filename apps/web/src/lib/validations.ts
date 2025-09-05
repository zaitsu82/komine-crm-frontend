import { z } from "zod";

export const customerFormSchema = z.object({
  // 顧客基本情報
  customerCode: z.string().min(1, "顧客コードは必須です"),
  plotNumber: z.string().optional(),
  section: z.string().optional(),
  
  // 契約者情報
  reservationDate: z.string().optional(),
  acceptanceNumber: z.string().optional(),
  permitDate: z.string().optional(),
  startDate: z.string().optional(),
  name: z.string().min(1, "氏名は必須です"),
  nameKana: z.string().min(1, "振り仮名は必須です"),
  birthDate: z.string().optional(),
  gender: z.union([
    z.enum(["male", "female"]),
    z.literal("").transform(() => undefined)
  ]).refine((val) => val !== undefined, {
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
    billingYears: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(1, "請求年数は1以上を入力してください")
    ]).optional(),
    area: z.string().optional(),
    unitPrice: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(0, "単価は0以上を入力してください")
    ]).optional(),
    usageFee: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(0, "使用料は0以上を入力してください")
    ]).optional(),
    paymentMethod: z.string().optional(),
  }).optional(),
  
  // 管理料
  managementFee: z.object({
    calculationType: z.string().optional(),
    taxType: z.string().optional(),
    billingType: z.string().optional(),
    billingYears: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(1, "請求年数は1以上を入力してください")
    ]).optional(),
    area: z.string().optional(),
    billingMonth: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(1, "請求月は1以上を入力してください").max(12, "請求月は12以下を入力してください")
    ]).optional(),
    managementFee: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(0, "管理料は0以上を入力してください")
    ]).optional(),
    unitPrice: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(0, "単価は0以上を入力してください")
    ]).optional(),
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
    mailingType: z.union([
      z.enum(["home", "work", "other"]),
      z.literal("").transform(() => undefined)
    ]).refine((val) => val !== undefined, {
      message: "送付先区分を選択してください",
    }),
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
    gender: z.union([
      z.enum(["male", "female"]),
      z.literal("").transform(() => undefined)
    ]).refine((val) => val !== undefined, {
      message: "性別を選択してください",
    }),
    burialDate: z.string().min(1, "埋葬日は必須です"),
    memo: z.string().optional(),
  })).optional(),
  
  plotInfo: z.object({
    plotNumber: z.string().optional(),
    section: z.string().optional(),
    usage: z.enum(["in_use", "available", "reserved"]).optional(),
    size: z.string().optional(),
    price: z.union([
      z.string().length(0).transform(() => undefined),
      z.coerce.number().min(0, "金額は0以上である必要があります")
    ]).optional(),
    contractDate: z.string().optional(),
  }).optional(),
  
  // 後方互換性のため残すフィールド
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;