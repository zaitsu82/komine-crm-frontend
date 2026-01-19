import { Customer, OwnedPlot } from '@/types/customer';

export const demoCustomers: Customer[] = [
  {
    id: 'DEMO001',
    customerCode: 'A-001',
    plotNumber: 'A-001',
    plotPeriod: '1期',
    section: 'A',
    // 複数区画所有（合わせ技の例）
    ownedPlots: [
      {
        id: 'plot-001-1',
        plotNumber: 'A-001',
        plotPeriod: '1期',
        section: 'A',
        sizeType: 'half',
        areaSqm: 1.8,
        purchaseDate: new Date('2024-02-01'),
        price: 270000,
        status: 'in_use',
      },
      {
        id: 'plot-001-2',
        plotNumber: 'A-002',
        plotPeriod: '1期',
        section: 'A',
        sizeType: 'half',
        areaSqm: 1.8,
        purchaseDate: new Date('2024-02-01'),
        price: 270000,
        status: 'in_use',
      }
    ],
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

    // 請求情報
    billingInfo: {
      billingType: 'bank_transfer',
      institutionName: '福岡銀行',
      branchName: '小倉支店',
      accountType: 'ordinary',
      symbolNumber: '123',
      accountNumber: '4567890',
      accountHolder: 'タナカ タロウ',
      type: '口座振替'
    },

    // 家族・連絡先情報
    familyContacts: [
      {
        id: 'family-001',
        name: '田中 次郎',
        nameKana: 'たなか じろう',
        relationship: '長男',
        gender: 'male',
        birthDate: new Date('1980-05-10'),
        phoneNumber: '090-2222-3333',
        faxNumber: '093-561-3456',
        email: 'tanaka.jiro@example.com',
        address: '福岡県北九州市小倉北区清水3-5-10',
        registeredAddress: '福岡県北九州市小倉北区清水2-12-15',
        mailingType: 'home',
        companyName: '株式会社ABC商事',
        companyNameKana: 'かぶしきがいしゃえーびーしーしょうじ',
        companyAddress: '福岡県北九州市小倉北区船場町1-1-1',
        companyPhone: '093-521-1234',
        notes: '主要連絡先。父の墓守として対応'
      },
      {
        id: 'family-002',
        name: '田中 美咲',
        nameKana: 'たなか みさき',
        relationship: '長女',
        gender: 'female',
        birthDate: new Date('1983-09-25'),
        phoneNumber: '080-4444-5555',
        email: 'tanaka.misaki@example.com',
        address: '東京都世田谷区用賀2-8-15',
        mailingType: 'home',
        notes: '東京在住。年末年始に帰省'
      }
    ],

    // 埋葬者情報
    buriedPersons: [
      {
        id: 'buried-001',
        name: '田中 一郎',
        nameKana: 'たなか いちろう',
        relationship: '父',
        gender: 'male',
        birthDate: new Date('1938-04-15'),
        deathDate: new Date('2023-12-15'),
        age: 85,
        posthumousName: '釋浄覚信士',
        religion: '浄土宗',
        reportDate: new Date('2023-12-20'),
        burialDate: new Date('2024-01-10'),
        memo: '浄土寺にて法要実施'
      },
      {
        id: 'buried-002',
        name: '田中 花子',
        nameKana: 'たなか はなこ',
        relationship: '母',
        gender: 'female',
        birthDate: new Date('1943-08-20'),
        deathDate: new Date('2024-03-20'),
        age: 80,
        posthumousName: '釋浄妙信女',
        religion: '浄土宗',
        reportDate: new Date('2024-03-25'),
        burialDate: new Date('2024-04-05'),
        memo: '夫と同じ浄土寺にて法要'
      }
    ],

    // 工事情報
    constructionRecords: [
      {
        id: 'construction-001',
        contractorName: '石材店A',
        constructionType: 'gravestone',
        startDate: new Date('2024-04-01'),
        scheduledEndDate: new Date('2024-05-31'),
        endDate: new Date('2024-05-15'),
        description: '洋型墓石（御影石）の設置。基礎工事含む。',
        constructionAmount: 850000,
        paidAmount: 850000,
        notes: '完工検査済み'
      },
      {
        id: 'construction-002',
        contractorName: '石材店A',
        constructionType: 'enclosure',
        startDate: new Date('2024-05-20'),
        scheduledEndDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-10'),
        description: '外柵工事（御影石、正面開口型）',
        constructionAmount: 320000,
        paidAmount: 320000,
        notes: '墓石工事と同一業者'
      },
      {
        id: 'construction-003',
        contractorName: '緑化サービスB',
        constructionType: 'additional',
        startDate: new Date('2024-06-15'),
        scheduledEndDate: new Date('2024-06-20'),
        endDate: new Date('2024-06-18'),
        description: '植栽工事（低木植込み、防草シート施工）',
        constructionAmount: 85000,
        paidAmount: 85000,
        notes: '年1回の剪定サービス付き'
      }
    ],

    // 更新履歴（契約者情報スナップショット）
    historyRecords: [
      {
        id: 'history-001',
        updatedAt: new Date('2024-01-10'),
        updatedBy: '佐藤 一郎',
        reasonType: 'new_registration',
        reasonDetail: '新規契約',
        contractorSnapshot: {
          name: '田中 太郎',
          nameKana: 'たなか たろう',
          birthDate: new Date('1955-03-15'),
          gender: 'male',
          postalCode: '803-0841',
          address: '福岡県北九州市小倉北区清水2-12-15',
          phoneNumber: '090-1234-5678',
          faxNumber: '093-561-2345',
          email: 'tanaka.taro@example.com'
        }
      },
      {
        id: 'history-002',
        updatedAt: new Date('2024-02-15'),
        updatedBy: '鈴木 次郎',
        reasonType: 'burial_update',
        reasonDetail: '父（田中一郎）の埋葬情報を登録',
        contractorSnapshot: {
          name: '田中 太郎',
          nameKana: 'たなか たろう',
          birthDate: new Date('1955-03-15'),
          gender: 'male',
          postalCode: '803-0841',
          address: '福岡県北九州市小倉北区清水2-12-15',
          phoneNumber: '090-1234-5678',
          faxNumber: '093-561-2345',
          email: 'tanaka.taro@example.com'
        }
      },
      {
        id: 'history-003',
        updatedAt: new Date('2024-04-10'),
        updatedBy: '鈴木 次郎',
        reasonType: 'burial_update',
        reasonDetail: '母（田中花子）の埋葬情報を登録',
        contractorSnapshot: {
          name: '田中 太郎',
          nameKana: 'たなか たろう',
          birthDate: new Date('1955-03-15'),
          gender: 'male',
          postalCode: '803-0841',
          address: '福岡県北九州市小倉北区清水2-12-15',
          phoneNumber: '090-1234-5678',
          faxNumber: '093-561-2345',
          email: 'tanaka.taro@example.com'
        }
      }
    ],

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
    // 1区画所有（通常）
    ownedPlots: [
      {
        id: 'plot-002-1',
        plotNumber: 'B-045',
        plotPeriod: '2期',
        section: '3',
        sizeType: 'full',
        areaSqm: 3.6,
        purchaseDate: new Date('2023-09-05'),
        price: 540000,
        status: 'in_use',
      }
    ],
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
    // 複数区画所有（2区画の合わせ技）
    ownedPlots: [
      {
        id: 'plot-003-1',
        plotNumber: 'C-29',
        plotPeriod: '3期',
        section: '樹林',
        sizeType: 'half',
        areaSqm: 1.8,
        purchaseDate: new Date('2024-03-10'),
        price: 270000,
        status: 'in_use',
      },
      {
        id: 'plot-003-2',
        plotNumber: 'C-30',
        plotPeriod: '3期',
        section: '樹林',
        sizeType: 'half',
        areaSqm: 1.8,
        purchaseDate: new Date('2024-03-10'),
        price: 270000,
        status: 'in_use',
      }
    ],
    reservationDate: new Date('2024-03-10'),
    acceptanceNumber: 'ACC-003',
    permitDate: new Date('2024-03-15'),
    startDate: new Date('2024-03-25'),
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