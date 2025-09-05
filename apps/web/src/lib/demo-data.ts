import { Customer } from '@/types/customer';

export const demoCustomers: Customer[] = [
  {
    id: 'DEMO001',
    customerCode: 'A-001',
    plotNumber: 'A-001',
    section: '東区',
    reservationDate: new Date('2024-01-15'),
    acceptanceNumber: 'ACC-001',
    permitDate: new Date('2024-02-01'),
    startDate: new Date('2024-02-15'),
    name: '田中 太郎',
    nameKana: 'たなか たろう',
    birthDate: new Date('1955-03-15'),
    gender: 'male',
    phoneNumber: '090-1234-5678',
    faxNumber: '093-561-2345',
    email: 'tanaka.taro@example.com',
    address: '福岡県北九州市小倉北区清水2-12-15',
    registeredAddress: '福岡県北九州市小倉北区清水2-12-15',
    
    applicantInfo: {
      applicationDate: new Date('2024-01-10'),
      staffName: '佐藤 一郎',
      name: '田中 太郎',
      nameKana: 'たなか たろう',
      postalCode: '803-0841',
      phoneNumber: '090-1234-5678',
      address: '福岡県北九州市小倉北区清水2-12-15'
    },
    
    usageFee: {
      calculationType: '固定',
      taxType: '税込',
      billingType: '一括',
      billingYears: '1',
      area: '4㎡',
      unitPrice: '75000',
      usageFee: '300000',
      paymentMethod: '銀行振込'
    },
    
    managementFee: {
      calculationType: '固定',
      taxType: '税込',
      billingType: '年払い',
      billingYears: '1',
      area: '4㎡',
      billingMonth: '4',
      managementFee: '12000',
      unitPrice: '3000',
      lastBillingMonth: '2024年04月',
      paymentMethod: '口座振替'
    },
    
    gravestoneInfo: {
      gravestoneBase: '御影石',
      enclosurePosition: '正面',
      gravestoneDealer: '石材店A',
      gravestoneType: '洋型',
      surroundingArea: '植栽',
      establishmentDeadline: new Date('2024-12-31'),
      establishmentDate: new Date('2024-06-15')
    },
    
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15'),
    status: 'active'
  },
  
  {
    id: 'DEMO002',
    customerCode: 'B-045',
    plotNumber: 'B-045',
    section: '西区',
    reservationDate: new Date('2023-08-20'),
    acceptanceNumber: 'ACC-002',
    permitDate: new Date('2023-09-05'),
    startDate: new Date('2023-09-20'),
    name: '山田 花子',
    nameKana: 'やまだ はなこ',
    birthDate: new Date('1960-07-22'),
    gender: 'female',
    phoneNumber: '080-9876-5432',
    email: 'yamada.hanako@example.com',
    address: '福岡県福岡市中央区天神1-2-3',
    registeredAddress: '福岡県福岡市中央区天神1-2-3',
    
    applicantInfo: {
      applicationDate: new Date('2023-08-15'),
      staffName: '鈴木 次郎',
      name: '山田 花子',
      nameKana: 'やまだ はなこ',
      postalCode: '810-0001',
      phoneNumber: '080-9876-5432',
      address: '福岡県福岡市中央区天神1-2-3'
    },
    
    usageFee: {
      calculationType: '面積割',
      taxType: '税別',
      billingType: '分割',
      billingYears: '2',
      area: '6㎡',
      unitPrice: '60000',
      usageFee: '360000',
      paymentMethod: '現金'
    },
    
    managementFee: {
      calculationType: '固定',
      taxType: '税込',
      billingType: '年払い',
      billingYears: '1',
      area: '6㎡',
      billingMonth: '3',
      managementFee: '15000',
      unitPrice: '2500',
      lastBillingMonth: '2024年03月',
      paymentMethod: '銀行振込'
    },
    
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2023-09-20'),
    status: 'active'
  },
  
  {
    id: 'DEMO003',
    customerCode: 'C-078',
    plotNumber: 'C-078',
    section: '南区',
    reservationDate: new Date('2024-03-10'),
    name: '佐藤 三郎',
    nameKana: 'さとう さぶろう',
    birthDate: new Date('1948-12-05'),
    gender: 'male',
    phoneNumber: '070-5555-1111',
    faxNumber: '092-111-2222',
    address: '福岡県福岡市南区大橋2-5-8',
    
    usageFee: {
      calculationType: '変動',
      taxType: '非課税',
      billingType: '月払い',
      billingYears: '1',
      area: '3㎡',
      unitPrice: '80000',
      usageFee: '240000',
      paymentMethod: 'クレジット'
    },
    
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
    status: 'active'
  }
];