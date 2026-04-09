import type { PlotFormData } from '@/lib/validations/plot-form';
import type { PreviewSection, PreviewDiffSection } from '@/components/shared/dialogs';

type SectionConfig = {
  title: string;
  fields: { key: string; label: string; format?: (v: unknown) => string }[];
};

const formatDate = (v: unknown) => (v ? String(v) : '');
const formatNumber = (v: unknown) => (v !== null && v !== undefined ? String(v) : '');
const formatGender = (v: unknown) => {
  if (v === 'MALE') return '男性';
  if (v === 'FEMALE') return '女性';
  if (v === 'OTHER') return 'その他';
  return '';
};
const formatRole = (v: unknown) => {
  if (v === 'APPLICANT') return '申込者';
  if (v === 'CONTRACTOR') return '契約者';
  return String(v ?? '');
};
const formatPaymentStatus = (v: unknown) => {
  const map: Record<string, string> = {
    Unpaid: '未払い', PartialPaid: '一部支払い済み', Paid: '支払い済み',
    Overdue: '延滞', Refunded: '返金済み', Cancelled: 'キャンセル',
  };
  return map[String(v)] ?? String(v ?? '');
};

const sectionConfigs: SectionConfig[] = [
  {
    title: '物理区画情報',
    fields: [
      { key: 'physicalPlot.plotNumber', label: '区画番号' },
      { key: 'physicalPlot.areaName', label: '区画（期）' },
      { key: 'physicalPlot.areaSqm', label: '面積（㎡）', format: formatNumber },
      { key: 'physicalPlot.notes', label: '備考' },
    ],
  },
  {
    title: '契約区画情報',
    fields: [
      { key: 'contractPlot.contractAreaSqm', label: '契約面積（㎡）', format: formatNumber },
      { key: 'contractPlot.locationDescription', label: '区画位置詳細' },
    ],
  },
  {
    title: '販売契約情報',
    fields: [
      { key: 'saleContract.contractDate', label: '契約日', format: formatDate },
      { key: 'saleContract.price', label: '金額', format: formatNumber },
      { key: 'saleContract.paymentStatus', label: '支払状態', format: formatPaymentStatus },
      { key: 'saleContract.reservationDate', label: '予約日', format: formatDate },
      { key: 'saleContract.acceptanceNumber', label: '受付番号' },
      { key: 'saleContract.acceptanceDate', label: '受付日', format: formatDate },
      { key: 'saleContract.permitDate', label: '許可日', format: formatDate },
      { key: 'saleContract.permitNumber', label: '許可番号' },
      { key: 'saleContract.startDate', label: '使用開始日', format: formatDate },
      { key: 'saleContract.staffInCharge', label: '担当者' },
      { key: 'saleContract.agentName', label: '取扱' },
      { key: 'saleContract.notes', label: '備考' },
    ],
  },
  {
    title: '契約者情報',
    fields: [
      { key: 'customer.name', label: '氏名' },
      { key: 'customer.nameKana', label: '氏名カナ' },
      { key: 'customer.birthDate', label: '生年月日', format: formatDate },
      { key: 'customer.gender', label: '性別', format: formatGender },
      { key: 'customer.postalCode', label: '郵便番号' },
      { key: 'customer.address', label: '住所' },
      { key: 'customer.addressLine2', label: '住所2' },
      { key: 'customer.registeredAddress', label: '本籍地' },
      { key: 'customer.phoneNumber', label: '電話番号' },
      { key: 'customer.faxNumber', label: 'FAX' },
      { key: 'customer.email', label: 'メール' },
      { key: 'customer.role', label: '役割', format: formatRole },
      { key: 'customer.notes', label: '備考' },
    ],
  },
  {
    title: '使用料',
    fields: [
      { key: 'usageFee.calculationType', label: '計算区分' },
      { key: 'usageFee.taxType', label: '税区分' },
      { key: 'usageFee.billingType', label: '請求区分' },
      { key: 'usageFee.billingYears', label: '請求年数', format: formatNumber },
      { key: 'usageFee.usageFee', label: '使用料', format: formatNumber },
      { key: 'usageFee.area', label: '面積', format: formatNumber },
      { key: 'usageFee.unitPrice', label: '単価', format: formatNumber },
      { key: 'usageFee.paymentMethod', label: '支払方法' },
    ],
  },
  {
    title: '管理料',
    fields: [
      { key: 'managementFee.calculationType', label: '計算区分' },
      { key: 'managementFee.taxType', label: '税区分' },
      { key: 'managementFee.billingType', label: '請求区分' },
      { key: 'managementFee.billingYears', label: '請求年数', format: formatNumber },
      { key: 'managementFee.area', label: '面積', format: formatNumber },
      { key: 'managementFee.billingMonth', label: '請求月' },
      { key: 'managementFee.managementFee', label: '管理料', format: formatNumber },
      { key: 'managementFee.unitPrice', label: '単価', format: formatNumber },
      { key: 'managementFee.lastBillingMonth', label: '最終請求月' },
      { key: 'managementFee.paymentMethod', label: '支払方法' },
    ],
  },
  {
    title: '勤務先情報',
    fields: [
      { key: 'workInfo.companyName', label: '勤務先名称' },
      { key: 'workInfo.companyNameKana', label: '勤務先名称カナ' },
      { key: 'workInfo.workPostalCode', label: '勤務先郵便番号' },
      { key: 'workInfo.workPhoneNumber', label: '勤務先電話番号' },
      { key: 'workInfo.workAddress', label: '勤務先住所' },
    ],
  },
  {
    title: '請求情報',
    fields: [
      { key: 'billingInfo.billingType', label: '請求区分' },
      { key: 'billingInfo.bankName', label: '金融機関名' },
      { key: 'billingInfo.branchName', label: '支店名' },
      { key: 'billingInfo.accountType', label: '口座種別' },
      { key: 'billingInfo.accountNumber', label: '口座番号' },
      { key: 'billingInfo.accountHolder', label: '口座名義' },
    ],
  },
  {
    title: '墓石情報',
    fields: [
      { key: 'gravestoneInfo.gravestoneBase', label: '墓石台' },
      { key: 'gravestoneInfo.enclosurePosition', label: '外柵位置' },
      { key: 'gravestoneInfo.gravestoneDealer', label: '石材店' },
      { key: 'gravestoneInfo.gravestoneType', label: '墓石種類' },
      { key: 'gravestoneInfo.surroundingArea', label: '周辺面積' },
      { key: 'gravestoneInfo.gravestoneCost', label: '墓石代', format: formatNumber },
      { key: 'gravestoneInfo.establishmentDeadline', label: '建立期限', format: formatDate },
      { key: 'gravestoneInfo.establishmentDate', label: '建立日', format: formatDate },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function formatFieldValue(value: unknown, format?: (v: unknown) => string): string {
  if (format) return format(value);
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

/**
 * 新規登録時のプレビューセクションを生成
 */
export function buildPlotPreviewSections(data: PlotFormData): PreviewSection[] {
  const sections: PreviewSection[] = [];

  for (const config of sectionConfigs) {
    const items = config.fields
      .map((f) => ({
        label: f.label,
        value: formatFieldValue(getNestedValue(data, f.key), f.format),
      }))
      .filter((item) => item.value !== '');
    if (items.length > 0) {
      sections.push({ title: config.title, items });
    }
  }

  // 家族連絡先
  if (data.familyContacts?.length) {
    for (let i = 0; i < data.familyContacts.length; i++) {
      const c = data.familyContacts[i];
      const items = [
        { label: '氏名', value: c.name || '' },
        { label: '続柄', value: c.relationship || '' },
        { label: '電話番号', value: c.phoneNumber || '' },
        { label: '住所', value: c.address || '' },
        { label: 'メール', value: c.email || '' },
      ].filter((item) => item.value !== '');
      if (items.length > 0) {
        sections.push({ title: `家族連絡先 ${i + 1}`, items });
      }
    }
  }

  // 埋葬者
  if (data.buriedPersons?.length) {
    for (let i = 0; i < data.buriedPersons.length; i++) {
      const p = data.buriedPersons[i];
      const items = [
        { label: '氏名', value: p.name || '' },
        { label: '命日', value: p.deathDate || '' },
        { label: '埋葬日', value: p.burialDate || '' },
        { label: '享年', value: p.age != null ? String(p.age) : '' },
        { label: '性別', value: formatGender(p.gender) },
      ].filter((item) => item.value !== '');
      if (items.length > 0) {
        sections.push({ title: `埋葬者 ${i + 1}`, items });
      }
    }
  }

  // 工事情報
  if (data.constructionInfos?.length) {
    for (let i = 0; i < data.constructionInfos.length; i++) {
      const ci = data.constructionInfos[i];
      const items = [
        { label: '工事種別', value: ci.constructionType || '' },
        { label: '施工業者', value: ci.contractor || '' },
        { label: '開始日', value: ci.startDate || '' },
        { label: '完了日', value: ci.completionDate || '' },
        { label: '工事内容', value: ci.constructionContent || '' },
      ].filter((item) => item.value !== '');
      if (items.length > 0) {
        sections.push({ title: `工事情報 ${i + 1}`, items });
      }
    }
  }

  return sections;
}

/**
 * 更新時の差分プレビューセクションを生成
 */
export function buildPlotDiffSections(
  original: PlotFormData,
  current: PlotFormData
): PreviewDiffSection[] {
  const sections: PreviewDiffSection[] = [];

  for (const config of sectionConfigs) {
    const items = config.fields
      .map((f) => ({
        label: f.label,
        before: formatFieldValue(getNestedValue(original, f.key), f.format),
        after: formatFieldValue(getNestedValue(current, f.key), f.format),
      }))
      .filter((item) => item.before !== item.after);
    if (items.length > 0) {
      sections.push({ title: config.title, items });
    }
  }

  return sections;
}
