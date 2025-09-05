import { Customer } from '@/types/customer';
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

    // 契約者情報
    contractorInfo: formData.contractorInfo && (
      formData.contractorInfo.reservationDate || 
      formData.contractorInfo.acceptanceNumber || 
      formData.contractorInfo.startDate
    ) ? {
      reservationDate: parseDate(formData.contractorInfo.reservationDate),
      acceptanceNumber: formData.contractorInfo.acceptanceNumber || '',
      permitDate: parseDate(formData.contractorInfo.permitDate),
      startDate: parseDate(formData.contractorInfo.startDate),
      name: formData.name, // メインの契約者名を使用
      nameKana: formData.nameKana, // メインの契約者名かなを使用
      birthDate: parseDate(formData.birthDate), // メインの生年月日を使用
      gender: formData.gender as 'male' | 'female' | 'other', // メインの性別を使用
      address: formData.address, // メインの住所を使用
      phoneNumber: formData.phoneNumber, // メインの電話番号を使用
      faxNumber: formData.faxNumber || '', // メインのFAXを使用
      email: formData.email || '', // メインのメールを使用
      registeredAddress: formData.contractorInfo.registeredAddress || '',
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
      billingYears: formData.usageFee.billingYears || 0,
      area: formData.usageFee.area || '',
      unitPrice: formData.usageFee.unitPrice || 0,
      usageFee: formData.usageFee.usageFee || 0,
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
      billingYears: formData.managementFee.billingYears || 0,
      area: formData.managementFee.area || '',
      billingMonth: formData.managementFee.billingMonth || 0,
      managementFee: formData.managementFee.managementFee || 0,
      unitPrice: formData.managementFee.unitPrice || 0,
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
      price: formData.plotInfo.price || 0,
      contractDate: parseDate(formData.plotInfo.contractDate),
    } : null,

    status: 'active',
  };
}