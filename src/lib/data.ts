import { Customer } from '@/types/customer';
import type { 
  PlotUnit, 
  CustomerPlotAssignment, 
  PlotAvailabilityCheck,
  PlotStatus 
} from '@/types/customer';
import { CustomerFormData } from '@/lib/validations';
import { demoCustomers } from '@/lib/demo-data';

// 顧客ステータスとビジネスルール
export type ContractStatus = 'active' | 'attention' | 'overdue';

export interface CustomerStatus {
  status: ContractStatus;
  label: string;
  icon: string;
  className: string;
}

// モックデータストア（実際のプロダクションではSupabaseやAPI接続に置き換える）
// デモデータを初期値として設定
export const mockCustomers: Customer[] = [...demoCustomers];

// カスタマー検索機能
export function searchCustomers(query: string): Customer[] {
  if (!query.trim()) {
    return mockCustomers;
  }

  const lowercaseQuery = query.toLowerCase();
  
  return mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(lowercaseQuery) ||
    customer.nameKana.toLowerCase().includes(lowercaseQuery) ||
    (customer.customerCode?.toLowerCase().includes(lowercaseQuery) || false) ||
    (customer.phoneNumber?.includes(query) || false) ||
    (customer.postalCode?.includes(query) || false) ||
    customer.address.toLowerCase().includes(lowercaseQuery)
  );
}

// ID で特定の顧客を取得
export function getCustomerById(id: string): Customer | undefined {
  return mockCustomers.find(customer => customer.id === id);
}

// 顧客コードで特定の顧客を取得
export function getCustomerByCustomerCode(customerCode: string): Customer | undefined {
  return mockCustomers.find(customer => customer.customerCode === customerCode);
}

// 使用状況別で顧客をフィルタリング
export function getCustomersByUsage(usage: 'in_use' | 'available' | 'reserved'): Customer[] {
  return mockCustomers.filter(customer => customer.plotInfo?.usage === usage);
}

// 顧客を作成
export function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
  const newCustomer: Customer = {
    ...customerData,
    id: `${mockCustomers.length + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockCustomers.push(newCustomer);
  return newCustomer;
}

// 顧客を更新
export function updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt'>>): Customer | null {
  const customerIndex = mockCustomers.findIndex(customer => customer.id === id);
  
  if (customerIndex === -1) {
    return null;
  }
  
  const updatedCustomer: Customer = {
    ...mockCustomers[customerIndex],
    ...customerData,
    updatedAt: new Date(),
  };
  
  mockCustomers[customerIndex] = updatedCustomer;
  return updatedCustomer;
}

// 顧客を削除
export function deleteCustomer(id: string): boolean {
  const customerIndex = mockCustomers.findIndex(customer => customer.id === id);
  
  if (customerIndex === -1) {
    return false;
  }
  
  mockCustomers.splice(customerIndex, 1);
  return true;
}

// 顧客ステータス判定のビジネスロジック
export function getCustomerStatus(customer: Customer): CustomerStatus {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  
  // 契約が非アクティブな場合
  if (customer.status === 'inactive') {
    return {
      status: 'attention',
      label: '要対応',
      icon: '■',
      className: 'text-status-attention bg-red-50 border-red-200'
    };
  }
  
  // 長期間更新されていない場合（2年以上）
  if (customer.updatedAt < twoYearsAgo) {
    return {
      status: 'overdue',
      label: '要対応',
      icon: '■',
      className: 'text-status-attention bg-red-50 border-red-200'
    };
  }
  
  // 1年以上更新されていない場合（注意要）
  if (customer.updatedAt < oneYearAgo) {
    return {
      status: 'attention',
      label: '滞納注意',
      icon: '▲',
      className: 'text-status-warning bg-yellow-50 border-yellow-200'
    };
  }
  
  // 通常の契約中ステータス
  return {
    status: 'active',
    label: '契約中',
    icon: '●',
    className: 'text-status-active bg-green-50 border-green-200'
  };
}

// あいう順フィルタリング関数
export function filterByAiueo(customers: Customer[], aiueoKey: string): Customer[] {
  if (aiueoKey === '全') {
    return customers;
  }
  
  const patterns: Record<string, RegExp> = {
    'あ': /^[あ-お]/,
    'か': /^[か-ご]/,
    'さ': /^[さ-ぞ]/,
    'た': /^[た-ど]/,
    'な': /^[な-の]/,
    'は': /^[は-ぽ]/,
    'ま': /^[ま-も]/,
    'や': /^[や-よ]/,
    'ら': /^[ら-ろ]/,
    'わ': /^[わ-ん]/,
    'その他': /^[^あ-ん]/
  };
  
  const pattern = patterns[aiueoKey];
  if (!pattern) return customers;
  
  return customers.filter(customer => 
    pattern.test(customer.nameKana.charAt(0))
  );
}

// あいう順ソート関数
export function sortByKana(customers: Customer[]): Customer[] {
  return [...customers].sort((a, b) => 
    a.nameKana.localeCompare(b.nameKana, 'ja', { numeric: true })
  );
}

// フォームデータから顧客データに変換
export function formDataToCustomer(formData: CustomerFormData): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {
  // 日付文字列をDateオブジェクトに変換するヘルパー関数
  const parseDate = (dateString?: string): Date | null => {
    if (!dateString || dateString === '') return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // 家族・連絡先の変換
  const familyContacts = (formData.familyContacts || []).map(contact => ({
    id: contact.id,
    name: contact.name,
    birthDate: parseDate(contact.birthDate),
    relationship: contact.relationship,
    address: contact.address,
    phoneNumber: contact.phoneNumber,
    faxNumber: contact.faxNumber || undefined,
    email: contact.email || undefined,
    registeredAddress: contact.registeredAddress || undefined,
    mailingType: contact.mailingType as 'home' | 'work' | 'other' | undefined,
    companyName: contact.companyName || undefined,
    companyNameKana: contact.companyNameKana || undefined,
    companyAddress: contact.companyAddress || undefined,
    companyPhone: contact.companyPhone || undefined,
    notes: contact.notes || undefined,
  }));

  // 埋葬者の変換
  const buriedPersons = (formData.buriedPersons || []).map(person => ({
    id: person.id,
    name: person.name,
    gender: person.gender as 'male' | 'female' | undefined,
    burialDate: parseDate(person.burialDate),
    memo: person.memo || undefined,
  }));

  return {
    customerCode: formData.customerCode,
    plotNumber: formData.plotNumber || undefined,
    section: formData.section || undefined,
    reservationDate: parseDate(formData.reservationDate),
    acceptanceNumber: formData.acceptanceNumber || undefined,
    permitDate: parseDate(formData.permitDate),
    startDate: parseDate(formData.startDate),
    name: formData.name,
    nameKana: formData.nameKana,
    birthDate: parseDate(formData.birthDate),
    gender: formData.gender as 'male' | 'female' | undefined,
    phoneNumber: formData.phoneNumber,
    faxNumber: formData.faxNumber || undefined,
    email: formData.email || undefined,
    address: formData.address,
    registeredAddress: formData.registeredAddress || undefined,
    // 後方互換性のため残すフィールド
    postalCode: formData.postalCode || undefined,
    prefecture: formData.prefecture || undefined,  
    city: formData.city || undefined,
    
    // 申込者情報
    applicantInfo: formData.applicantInfo && (
      formData.applicantInfo.name || 
      formData.applicantInfo.applicationDate || 
      formData.applicantInfo.staffName
    ) ? {
      applicationDate: parseDate(formData.applicantInfo.applicationDate),
      staffName: formData.applicantInfo.staffName || '',
      name: formData.applicantInfo.name || '',
      nameKana: formData.applicantInfo.nameKana || '',
      postalCode: formData.applicantInfo.postalCode || '',
      address: formData.applicantInfo.address || '',
      phoneNumber: formData.applicantInfo.phoneNumber || '',
    } : undefined,

    // 勤務先・連絡情報
    workInfo: formData.workInfo && (
      formData.workInfo.companyName || 
      formData.workInfo.workAddress || 
      formData.workInfo.dmSetting
    ) ? {
      companyName: formData.workInfo.companyName || '',
      companyNameKana: formData.workInfo.companyNameKana || '',
      workAddress: formData.workInfo.workAddress || '',
      workPostalCode: formData.workInfo.workPostalCode || '',
      workPhoneNumber: formData.workInfo.workPhoneNumber || '',
      dmSetting: formData.workInfo.dmSetting || 'allow',
      addressType: formData.workInfo.addressType || 'home',
      notes: formData.workInfo.notes || '',
    } : undefined,

    // 請求情報
    billingInfo: formData.billingInfo && (
      formData.billingInfo.bankName || 
      formData.billingInfo.accountNumber || 
      formData.billingInfo.billingType
    ) ? {
      billingType: formData.billingInfo.billingType || 'individual',
      bankName: formData.billingInfo.bankName || '',
      branchName: formData.billingInfo.branchName || '',
      accountType: formData.billingInfo.accountType || 'ordinary',
      accountNumber: formData.billingInfo.accountNumber || '',
      accountHolder: formData.billingInfo.accountHolder || '',
    } : undefined,

    // 使用料
    usageFee: formData.usageFee && (
      formData.usageFee.calculationType || 
      formData.usageFee.usageFee !== undefined ||
      formData.usageFee.area
    ) ? {
      calculationType: formData.usageFee.calculationType || '',
      taxType: formData.usageFee.taxType || '',
      billingType: formData.usageFee.billingType || '',
      billingYears: String(formData.usageFee.billingYears || ''),
      area: formData.usageFee.area || '',
      unitPrice: String(formData.usageFee.unitPrice || ''),
      usageFee: String(formData.usageFee.usageFee || ''),
      paymentMethod: formData.usageFee.paymentMethod || '',
    } : undefined,

    // 管理料
    managementFee: formData.managementFee && (
      formData.managementFee.calculationType || 
      formData.managementFee.managementFee !== undefined ||
      formData.managementFee.area
    ) ? {
      calculationType: formData.managementFee.calculationType || '',
      taxType: formData.managementFee.taxType || '',
      billingType: formData.managementFee.billingType || '',
      billingYears: String(formData.managementFee.billingYears || ''),
      area: formData.managementFee.area || '',
      billingMonth: String(formData.managementFee.billingMonth || ''),
      managementFee: String(formData.managementFee.managementFee || ''),
      unitPrice: String(formData.managementFee.unitPrice || ''),
      lastBillingMonth: formData.managementFee.lastBillingMonth || '',
      paymentMethod: formData.managementFee.paymentMethod || '',
    } : undefined,

    // 墓石情報
    gravestoneInfo: formData.gravestoneInfo && (
      formData.gravestoneInfo.gravestoneBase || 
      formData.gravestoneInfo.gravestoneType || 
      formData.gravestoneInfo.establishmentDate
    ) ? {
      gravestoneBase: formData.gravestoneInfo.gravestoneBase || '',
      enclosurePosition: formData.gravestoneInfo.enclosurePosition || '',
      gravestoneDealer: formData.gravestoneInfo.gravestoneDealer || '',
      gravestoneType: formData.gravestoneInfo.gravestoneType || '',
      surroundingArea: formData.gravestoneInfo.surroundingArea || '',
      establishmentDeadline: parseDate(formData.gravestoneInfo.establishmentDeadline),
      establishmentDate: parseDate(formData.gravestoneInfo.establishmentDate),
    } : undefined,

    familyContacts,
    buriedPersons,

    // 緊急連絡先（後方互換性）
    emergencyContact: formData.emergencyContact && formData.emergencyContact.name ? {
      name: formData.emergencyContact.name,
      relationship: formData.emergencyContact.relationship,
      phoneNumber: formData.emergencyContact.phoneNumber,
    } : null,

    // 墓地区画情報
    plotInfo: formData.plotInfo && (
      formData.plotInfo.plotNumber || 
      formData.plotInfo.section || 
      formData.plotInfo.usage
    ) ? {
      plotNumber: formData.plotInfo.plotNumber || '',
      section: formData.plotInfo.section || '',
      usage: formData.plotInfo.usage || 'available',
      size: formData.plotInfo.size || '',
      price: String(formData.plotInfo.price || ''),
      contractDate: parseDate(formData.plotInfo.contractDate),
    } : null,

    status: 'active',
  };
}

// ===== 区画管理関連の関数 =====

// モック区画データ（実際のプロダクションではSupabaseやAPI接続に置き換える）
export const mockPlotUnits: PlotUnit[] = [
  {
    id: 'plot-1',
    plotNumber: 'A-56',
    section: '東区',
    type: 'grave_site',
    areaSqm: 10.5,
    baseCapacity: 4,
    allowGoushi: true,
    basePrice: 1575000,
    currentStatus: 'available',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: 'plot-2',
    plotNumber: 'B-12',
    section: '西区',
    type: 'columbarium',
    areaSqm: 5.0,
    baseCapacity: 2,
    allowGoushi: false,
    basePrice: 1000000,
    currentStatus: 'in_use',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01'),
  },
  {
    id: 'plot-3',
    plotNumber: 'C-33',
    section: '南区',
    type: 'ossuary',
    areaSqm: 8.0,
    baseCapacity: 6,
    allowGoushi: true,
    basePrice: 800000,
    currentStatus: 'reserved',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
  },
];

/**
 * 区画番号で区画ユニットを取得
 */
export function getPlotUnitByNumber(plotNumber: string): PlotUnit | undefined {
  return mockPlotUnits.find(unit => unit.plotNumber === plotNumber);
}

/**
 * 空き区画を検索
 */
export function searchAvailablePlots(
  section?: string,
  type?: string
): PlotUnit[] {
  return mockPlotUnits.filter(unit => {
    if (unit.currentStatus !== 'available') return false;
    if (section && unit.section !== section) return false;
    if (type && unit.type !== type) return false;
    return true;
  });
}

/**
 * 区画の在庫確認
 * 既に他の顧客に割り当てられているか確認
 */
export function checkPlotAvailability(
  plotNumber: string
): PlotAvailabilityCheck {
  const unit = getPlotUnitByNumber(plotNumber);
  
  if (!unit) {
    return {
      plotNumber,
      isAvailable: false,
      currentStatus: 'available',
      message: '指定された区画が見つかりません',
    };
  }
  
  // 既存の顧客で同じ区画を使用しているか確認
  const conflictingCustomers = mockCustomers
    .filter(customer => 
      customer.plotAssignments?.some(assignment => 
        assignment.plotNumber === plotNumber
      )
    )
    .map(customer => customer.id);
  
  const isAvailable = unit.currentStatus === 'available' && conflictingCustomers.length === 0;
  
  let message = '';
  if (unit.currentStatus === 'in_use') {
    message = '使用中の区画です。共同使用の場合は問題ありません。';
  } else if (unit.currentStatus === 'reserved') {
    message = '予約済みの区画です。別の顧客が予約している可能性があります。';
  } else if (conflictingCustomers.length > 0) {
    message = `既に${conflictingCustomers.length}件の顧客に割り当てられています。`;
  }
  
  return {
    plotNumber,
    isAvailable,
    currentStatus: unit.currentStatus,
    conflictingCustomers,
    message,
  };
}

/**
 * 区画ステータスを更新（API連携のシミュレーション）
 */
export async function updatePlotStatus(
  plotNumber: string,
  newStatus: PlotStatus
): Promise<{ success: boolean; message?: string }> {
  const unit = getPlotUnitByNumber(plotNumber);
  
  if (!unit) {
    return {
      success: false,
      message: `区画 ${plotNumber} が見つかりません`,
    };
  }
  
  // 実際のプロダクションでは、ここでAPIを呼び出す
  // const response = await fetch(`/api/v1/plots/${plotNumber}/status`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status: newStatus }),
  // });
  
  // モックでは直接更新
  unit.currentStatus = newStatus;
  unit.updatedAt = new Date();
  
  return {
    success: true,
    message: `区画 ${plotNumber} のステータスを ${newStatus} に更新しました`,
  };
}

/**
 * 複数の区画割当を保存時に検証・連携
 */
export async function savePlotAssignmentsWithSync(
  customerId: string,
  assignments: CustomerPlotAssignment[]
): Promise<{
  success: boolean;
  warnings: string[];
  errors: string[];
}> {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // 各割当の検証と連携
  for (const assignment of assignments) {
    if (!assignment.plotNumber) {
      // 新規ユニット（ドラフト）の場合はスキップ（将来対応）
      warnings.push(
        '新規区画は連携対象外です。区画マスタに登録後、再度割り当ててください。'
      );
      continue;
    }
    
    // 在庫確認
    const availabilityCheck = checkPlotAvailability(assignment.plotNumber);
    if (!availabilityCheck.isAvailable) {
      warnings.push(
        `区画 ${assignment.plotNumber}: ${availabilityCheck.message}`
      );
    }
    
    // ステータス更新を試行
    try {
      const result = await updatePlotStatus(
        assignment.plotNumber,
        assignment.desiredStatus
      );
      
      if (!result.success) {
        errors.push(
          `区画 ${assignment.plotNumber}: ステータス更新に失敗しました - ${result.message}`
        );
      }
    } catch (error) {
      errors.push(
        `区画 ${assignment.plotNumber}: API連携エラー - ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  }
  
  return {
    success: errors.length === 0,
    warnings,
    errors,
  };
}