import { Customer } from '@/types/customer';

export const demoCustomers: Customer[] = [
  {
    id: 'DEMO001',
    customerCode: 'A-001',
    plotNumber: 'A-001',
    plotPeriod: '1期',
    section: 'A',
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
    
    // 合祀情報サンプル
    collectiveBurialInfo: [
      {
        id: 'COLLECTIVE001',
        type: 'family',
        ceremonies: [
          {
            id: 'CEREMONY001',
            date: new Date('2024-09-23'),
            officiant: '浄土寺 慈恵和尚',
            religion: '浄土宗',
            participants: 15,
            location: '小霊園内 合祀堂',
            memo: '秋彼岸に実施'
          }
        ],
        persons: [
          {
            id: 'PERSON001',
            name: '田中 一郎',
            nameKana: 'たなか いちろう',
            relationship: '父',
            deathDate: new Date('2023-12-15'),
            age: 85,
            gender: 'male',
            originalPlotNumber: 'A-001-A',
            transferDate: new Date('2024-09-23'),
            certificateNumber: 'KAI-2024-001',
            memo: '元の墓所から移転'
          },
          {
            id: 'PERSON002',
            name: '田中 花子',
            nameKana: 'たなか はなこ',
            relationship: '母',
            deathDate: new Date('2024-03-20'),
            age: 80,
            gender: 'female',
            originalPlotNumber: 'A-001-B',
            transferDate: new Date('2024-09-23'),
            certificateNumber: 'KAI-2024-002',
            memo: '同日移転実施'
          }
        ],
        mainRepresentative: '長男（契約者本人）',
        totalFee: 500000,
        documents: [
          {
            id: 'DOC001',
            type: 'permit',
            name: '改葬許可証（田中一郎）',
            issuedDate: new Date('2024-09-10'),
            expiryDate: null,
            memo: '北九州市発行'
          },
          {
            id: 'DOC002',
            type: 'permit', 
            name: '改葬許可証（田中花子）',
            issuedDate: new Date('2024-09-10'),
            expiryDate: null,
            memo: '北九州市発行'
          },
          {
            id: 'DOC003',
            type: 'agreement',
            name: '合祀同意書',
            issuedDate: new Date('2024-09-01'),
            expiryDate: null,
            memo: '親族一同署名済み'
          }
        ],
        specialRequests: '浄土宗の作法に従い、阿弥陀如来への読経を重視していただきたい。特に父は念仏を大切にしていたため、その点への配慮をお願いします。',
        status: 'completed',
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-09-23')
      }
    ],
    
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15'),
    status: 'active'
  },
  
  {
    id: 'DEMO002',
    customerCode: 'B-045',
    plotNumber: 'B-045',
    plotPeriod: '2期',
    section: '3',
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
    plotPeriod: '3期',
    section: '樹林',
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