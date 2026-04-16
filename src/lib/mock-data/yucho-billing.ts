// ゆうちょ連携用請求データ（モック）
// 管理料（区画ベース）＋ 合祀料金の支払い管理用

export type YuchoBillingType = 'management' | 'collective';

export interface ManagementFeeBilling {
  id: string;
  contractPlotId: string;
  plotNumber: string;
  section: string;
  period: string;
  contractorName: string;
  contractorNameKana: string;
  yuchoSymbol: string;
  yuchoNumber: string;
  amount: number;
  billingYear: number;
  status: 'pending' | 'ready' | 'exported';
}

export interface CollectiveBurialBilling {
  id: string;
  collectiveBurialId: string;
  applicantName: string;
  applicantNameKana: string;
  deceasedName: string;
  yuchoSymbol: string;
  yuchoNumber: string;
  amount: number;
  billingYear: number;
  status: 'pending' | 'ready' | 'exported';
}

export const MOCK_MANAGEMENT_FEES: ManagementFeeBilling[] = [
  {
    id: 'mf-001',
    contractPlotId: 'cp-001',
    plotNumber: '1-A-15',
    section: '第1期A区画',
    period: '1期',
    contractorName: '田中 太郎',
    contractorNameKana: 'タナカ タロウ',
    yuchoSymbol: '10140',
    yuchoNumber: '12345671',
    amount: 12000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'mf-002',
    contractPlotId: 'cp-002',
    plotNumber: '1-A-16',
    section: '第1期A区画',
    period: '1期',
    contractorName: '佐藤 花子',
    contractorNameKana: 'サトウ ハナコ',
    yuchoSymbol: '10140',
    yuchoNumber: '23456782',
    amount: 12000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'mf-003',
    contractPlotId: 'cp-003',
    plotNumber: '2-B-08',
    section: '第2期B区画',
    period: '2期',
    contractorName: '鈴木 一郎',
    contractorNameKana: 'スズキ イチロウ',
    yuchoSymbol: '10150',
    yuchoNumber: '34567893',
    amount: 8000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'mf-004',
    contractPlotId: 'cp-004',
    plotNumber: '2-B-12',
    section: '第2期B区画',
    period: '2期',
    contractorName: '高橋 三郎',
    contractorNameKana: 'タカハシ サブロウ',
    yuchoSymbol: '10150',
    yuchoNumber: '45678904',
    amount: 8000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'mf-005',
    contractPlotId: 'cp-005',
    plotNumber: '3-C-22',
    section: '第3期C区画',
    period: '3期',
    contractorName: '渡辺 四郎',
    contractorNameKana: 'ワタナベ シロウ',
    yuchoSymbol: '10160',
    yuchoNumber: '56789015',
    amount: 6000,
    billingYear: 2026,
    status: 'pending',
  },
  {
    id: 'mf-006',
    contractPlotId: 'cp-006',
    plotNumber: '4-D-05',
    section: '第4期D区画',
    period: '4期',
    contractorName: '伊藤 美咲',
    contractorNameKana: 'イトウ ミサキ',
    yuchoSymbol: '10170',
    yuchoNumber: '67890126',
    amount: 15000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'mf-007',
    contractPlotId: 'cp-007',
    plotNumber: '5-E-11',
    section: '第5期E区画',
    period: '5期',
    contractorName: '山本 健司',
    contractorNameKana: 'ヤマモト ケンジ',
    yuchoSymbol: '10180',
    yuchoNumber: '78901237',
    amount: 10000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'mf-008',
    contractPlotId: 'cp-008',
    plotNumber: '5-E-18',
    section: '第5期E区画',
    period: '5期',
    contractorName: '中村 次郎',
    contractorNameKana: 'ナカムラ ジロウ',
    yuchoSymbol: '10180',
    yuchoNumber: '89012348',
    amount: 10000,
    billingYear: 2026,
    status: 'ready',
  },
];

export const MOCK_COLLECTIVE_BURIAL_FEES: CollectiveBurialBilling[] = [
  {
    id: 'cb-001',
    collectiveBurialId: 'cbid-001',
    applicantName: '小林 恵子',
    applicantNameKana: 'コバヤシ ケイコ',
    deceasedName: '小林 忠雄',
    yuchoSymbol: '10200',
    yuchoNumber: '11223344',
    amount: 5000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'cb-002',
    collectiveBurialId: 'cbid-002',
    applicantName: '加藤 洋子',
    applicantNameKana: 'カトウ ヨウコ',
    deceasedName: '加藤 誠',
    yuchoSymbol: '10200',
    yuchoNumber: '22334455',
    amount: 5000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'cb-003',
    collectiveBurialId: 'cbid-003',
    applicantName: '吉田 和雄',
    applicantNameKana: 'ヨシダ カズオ',
    deceasedName: '吉田 とし子',
    yuchoSymbol: '10210',
    yuchoNumber: '33445566',
    amount: 5000,
    billingYear: 2026,
    status: 'ready',
  },
  {
    id: 'cb-004',
    collectiveBurialId: 'cbid-004',
    applicantName: '山田 博志',
    applicantNameKana: 'ヤマダ ヒロシ',
    deceasedName: '山田 きみえ',
    yuchoSymbol: '10210',
    yuchoNumber: '44556677',
    amount: 5000,
    billingYear: 2026,
    status: 'pending',
  },
];

export function getYuchoBillings(billingYear: number) {
  const management = MOCK_MANAGEMENT_FEES.filter((f) => f.billingYear === billingYear);
  const collective = MOCK_COLLECTIVE_BURIAL_FEES.filter((f) => f.billingYear === billingYear);
  const managementTotal = management.reduce((sum, f) => sum + f.amount, 0);
  const collectiveTotal = collective.reduce((sum, f) => sum + f.amount, 0);
  return {
    management,
    collective,
    managementTotal,
    collectiveTotal,
    grandTotal: managementTotal + collectiveTotal,
    totalCount: management.length + collective.length,
  };
}
