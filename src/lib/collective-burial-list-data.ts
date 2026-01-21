/**
 * 合祀一覧のデータ管理
 * 
 * 画像のデータを基にしたモックデータと操作関数
 */

import {
  CollectiveBurialListRecord,
  CollectiveBurialYearGroup,
  CollectiveBurialListFilter,
  CollectiveBurialSection,
  calculateCollectiveBurialPeriod,
} from '@/types/collective-burial-list';

/**
 * 合祀一覧のモックデータ（ダミーデータ）
 */
export const mockCollectiveBurialListRecords: CollectiveBurialListRecord[] = [
  // 2026年合祀予定
  {
    id: 'CBL-001',
    name: '山田 太郎',
    nameKana: 'やまだ たろう',
    section: '阿弥陀',
    plotNumber: '51',
    contractYear: 2013,
    burialDate: new Date('2013-07-19'),
    collectiveBurialYear: 2026,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2013-07-19'),
    updatedAt: new Date('2013-07-19'),
  },

  // 2029年合祀予定
  {
    id: 'CBL-002',
    name: '佐藤 花子',
    nameKana: 'さとう はなこ',
    section: '阿弥陀',
    plotNumber: '28',
    contractYear: 2013,
    burialDate: new Date('2022-08-07'),
    collectiveBurialYear: 2029,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2013-01-01'),
    updatedAt: new Date('2022-08-07'),
  },

  // 2034年合祀予定（2021年契約グループ）
  {
    id: 'CBL-003',
    name: '鈴木 一郎',
    nameKana: 'すずき いちろう',
    section: '阿弥陀',
    plotNumber: '68',
    contractYear: 2021,
    burialDate: new Date('2021-05-02'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-05-02'),
    updatedAt: new Date('2021-05-02'),
  },
  {
    id: 'CBL-004',
    name: '高橋 和子',
    nameKana: 'たかはし かずこ',
    section: '不動',
    plotNumber: '80',
    contractYear: 2021,
    burialDate: new Date('2021-05-03'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-05-03'),
    updatedAt: new Date('2021-05-03'),
  },
  {
    id: 'CBL-005',
    name: '田中 健太',
    nameKana: 'たなか けんた',
    section: '天空',
    plotNumber: 'H-1・7・13',
    contractYear: 2021,
    burialDate: new Date('2021-06-26'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-06-26'),
    updatedAt: new Date('2021-06-26'),
  },
  {
    id: 'CBL-006',
    name: '伊藤 美咲',
    nameKana: 'いとう みさき',
    section: '阿弥陀',
    plotNumber: '57',
    contractYear: 2021,
    burialDate: new Date('2021-09-16'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-09-16'),
    updatedAt: new Date('2021-09-16'),
  },
  {
    id: 'CBL-007',
    name: '渡辺 正雄',
    nameKana: 'わたなべ まさお',
    section: '阿弥陀',
    plotNumber: '122・128',
    contractYear: 2021,
    burialDate: new Date('2021-09-28'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-09-28'),
    updatedAt: new Date('2021-09-28'),
  },
  {
    id: 'CBL-008',
    name: '小林 幸子',
    nameKana: 'こばやし さちこ',
    section: '阿弥陀',
    plotNumber: '76',
    contractYear: 2021,
    burialDate: new Date('2021-11-07'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-11-07'),
    updatedAt: new Date('2021-11-07'),
  },
  {
    id: 'CBL-009',
    name: '加藤 誠',
    nameKana: 'かとう まこと',
    section: '阿弥陀',
    plotNumber: '116',
    contractYear: 2021,
    burialDate: new Date('2022-08-30'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2022-08-30'),
  },
  {
    id: 'CBL-010',
    name: '吉田 修',
    nameKana: 'よしだ おさむ',
    section: '弥勒',
    plotNumber: '72',
    contractYear: 2021,
    burialDate: new Date('2021-07-17'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-07-17'),
    updatedAt: new Date('2021-07-17'),
  },
  {
    id: 'CBL-011',
    name: '山本 明美',
    nameKana: 'やまもと あけみ',
    section: '弥勒',
    plotNumber: '20',
    contractYear: 2021,
    burialDate: new Date('2021-08-08'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-08-08'),
    updatedAt: new Date('2021-08-08'),
  },
  {
    id: 'CBL-012',
    name: '中村 隆',
    nameKana: 'なかむら たかし',
    section: '天空',
    plotNumber: 'A-3',
    contractYear: 2021,
    burialDate: new Date('2021-08-18'),
    collectiveBurialYear: 2034,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2021-08-18'),
    updatedAt: new Date('2021-08-18'),
  },

  // 2035年合祀予定（2022年契約グループ）
  {
    id: 'CBL-013',
    name: '松本 広美',
    nameKana: 'まつもと ひろみ',
    section: '阿弥陀',
    plotNumber: '18',
    contractYear: 2022,
    burialDate: new Date('2015-01-10'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    notes: '2022年再契約',
    createdAt: new Date('2015-01-10'),
    updatedAt: new Date('2022-01-01'),
  },
  {
    id: 'CBL-014',
    name: '井上 美鈴',
    nameKana: 'いのうえ みすず',
    section: '阿弥陀',
    plotNumber: '5',
    contractYear: 2022,
    burialDate: new Date('2022-01-30'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-01-30'),
    updatedAt: new Date('2022-01-30'),
  },
  {
    id: 'CBL-015',
    name: '木村 由美子',
    nameKana: 'きむら ゆみこ',
    section: '弥勒',
    plotNumber: '25',
    contractYear: 2022,
    burialDate: new Date('2022-02-03'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-02-03'),
    updatedAt: new Date('2022-02-03'),
  },
  {
    id: 'CBL-016',
    name: '林 賢一郎',
    nameKana: 'はやし けんいちろう',
    section: '阿弥陀',
    plotNumber: '11・16',
    contractYear: 2022,
    burialDate: new Date('2022-02-14'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-02-14'),
    updatedAt: new Date('2022-02-14'),
  },
  {
    id: 'CBL-017',
    name: '斎藤 浩司',
    nameKana: 'さいとう こうじ',
    section: '阿弥陀',
    plotNumber: '1',
    contractYear: 2022,
    burialDate: new Date('2022-02-28'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-02-28'),
    updatedAt: new Date('2022-02-28'),
  },
  {
    id: 'CBL-018',
    name: '清水 加代子',
    nameKana: 'しみず かよこ',
    section: '天空',
    plotNumber: 'I-1',
    contractYear: 2022,
    burialDate: new Date('2022-04-03'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-04-03'),
    updatedAt: new Date('2022-04-03'),
  },
  {
    id: 'CBL-019',
    name: '山口 恵子',
    nameKana: 'やまぐち けいこ',
    section: '阿弥陀',
    plotNumber: '12',
    contractYear: 2022,
    burialDate: new Date('2022-05-05'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-05-05'),
    updatedAt: new Date('2022-05-05'),
  },
  {
    id: 'CBL-020',
    name: '森 敏江',
    nameKana: 'もり としえ',
    section: '天空',
    plotNumber: 'D-5',
    contractYear: 2022,
    burialDate: new Date('2022-06-09'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-06-09'),
    updatedAt: new Date('2022-06-09'),
  },
  {
    id: 'CBL-021',
    name: '池田 光司',
    nameKana: 'いけだ こうじ',
    section: '天空',
    plotNumber: 'I-3',
    contractYear: 2022,
    burialDate: new Date('2022-06-10'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-06-10'),
    updatedAt: new Date('2022-06-10'),
  },
  {
    id: 'CBL-022',
    name: '橋本 春美',
    nameKana: 'はしもと はるみ',
    section: '天空',
    plotNumber: 'B-5',
    contractYear: 2022,
    burialDate: new Date('2022-06-28'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-06-28'),
    updatedAt: new Date('2022-06-28'),
  },
  {
    id: 'CBL-023',
    name: '阿部 由美子',
    nameKana: 'あべ ゆみこ',
    section: '阿弥陀',
    plotNumber: '106・115',
    contractYear: 2022,
    burialDate: new Date('2022-07-02'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-07-02'),
    updatedAt: new Date('2022-07-02'),
  },
  {
    id: 'CBL-024',
    name: '石川 宣子',
    nameKana: 'いしかわ のぶこ',
    section: '不動',
    plotNumber: '77・83',
    contractYear: 2022,
    burialDate: new Date('2022-07-02'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-07-02'),
    updatedAt: new Date('2022-07-02'),
  },
  {
    id: 'CBL-025',
    name: '前田 加代子',
    nameKana: 'まえだ かよこ',
    section: '阿弥陀',
    plotNumber: '133',
    contractYear: 2022,
    burialDate: new Date('2022-07-03'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-07-03'),
    updatedAt: new Date('2022-07-03'),
  },
  {
    id: 'CBL-026',
    name: '藤井 正寛',
    nameKana: 'ふじい まさひろ',
    section: '阿弥陀',
    plotNumber: '10',
    contractYear: 2022,
    burialDate: new Date('2022-07-15'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-07-15'),
    updatedAt: new Date('2022-07-15'),
  },
  {
    id: 'CBL-027',
    name: '後藤 美知子',
    nameKana: 'ごとう みちこ',
    section: '天空',
    plotNumber: 'H-16',
    contractYear: 2022,
    burialDate: new Date('2022-08-27'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-08-27'),
    updatedAt: new Date('2022-08-27'),
  },
  {
    id: 'CBL-028',
    name: '岡田 秀夫',
    nameKana: 'おかだ ひでお',
    section: '阿弥陀',
    plotNumber: '100',
    contractYear: 2022,
    burialDate: new Date('2022-10-01'),
    collectiveBurialYear: 2035,
    periodType: '13year',
    count: 1,
    status: 'pending',
    createdAt: new Date('2022-10-01'),
    updatedAt: new Date('2022-10-01'),
  },
];

/**
 * 合祀一覧レコードを取得
 */
export function getCollectiveBurialListRecords(): CollectiveBurialListRecord[] {
  return [...mockCollectiveBurialListRecords].sort((a, b) => {
    // 合祀予定年でソート、同じ年なら納骨日でソート
    if (a.collectiveBurialYear !== b.collectiveBurialYear) {
      return a.collectiveBurialYear - b.collectiveBurialYear;
    }
    if (a.burialDate && b.burialDate) {
      return a.burialDate.getTime() - b.burialDate.getTime();
    }
    return 0;
  });
}

/**
 * 年別にグループ化した合祀一覧を取得
 */
export function getCollectiveBurialListByYear(): CollectiveBurialYearGroup[] {
  const records = getCollectiveBurialListRecords();
  const yearMap = new Map<number, CollectiveBurialListRecord[]>();

  records.forEach(record => {
    const year = record.collectiveBurialYear;
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)!.push(record);
  });

  const groups: CollectiveBurialYearGroup[] = [];
  yearMap.forEach((records, year) => {
    groups.push({
      year,
      records,
      totalCount: records.reduce((sum, r) => sum + r.count, 0),
    });
  });

  return groups.sort((a, b) => a.year - b.year);
}

/**
 * 特定の年の合祀一覧を取得
 */
export function getCollectiveBurialListBySpecificYear(year: number): CollectiveBurialListRecord[] {
  return getCollectiveBurialListRecords().filter(r => r.collectiveBurialYear === year);
}

/**
 * フィルター条件に基づいて合祀一覧を検索
 */
export function searchCollectiveBurialList(
  filter: CollectiveBurialListFilter
): CollectiveBurialListRecord[] {
  let records = getCollectiveBurialListRecords();

  if (filter.year) {
    records = records.filter(r => r.collectiveBurialYear === filter.year);
  }

  if (filter.section) {
    records = records.filter(r => r.section === filter.section);
  }

  if (filter.status) {
    records = records.filter(r => r.status === filter.status);
  }

  if (filter.contractYearFrom) {
    records = records.filter(r => r.contractYear >= filter.contractYearFrom!);
  }

  if (filter.contractYearTo) {
    records = records.filter(r => r.contractYear <= filter.contractYearTo!);
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    records = records.filter(r =>
      r.name.toLowerCase().includes(query) ||
      (r.nameKana && r.nameKana.toLowerCase().includes(query)) ||
      r.plotNumber.toLowerCase().includes(query)
    );
  }

  return records;
}

/**
 * 今年の合祀予定一覧を取得
 */
export function getCurrentYearCollectiveBurialList(): CollectiveBurialListRecord[] {
  const currentYear = new Date().getFullYear();
  return getCollectiveBurialListBySpecificYear(currentYear);
}

/**
 * 来年の合祀予定一覧を取得
 */
export function getNextYearCollectiveBurialList(): CollectiveBurialListRecord[] {
  const nextYear = new Date().getFullYear() + 1;
  return getCollectiveBurialListBySpecificYear(nextYear);
}

/**
 * 合祀予定年の一覧を取得（ユニークな年のリスト）
 */
export function getAvailableCollectiveBurialYears(): number[] {
  const years = new Set<number>();
  mockCollectiveBurialListRecords.forEach(r => years.add(r.collectiveBurialYear));
  return Array.from(years).sort((a, b) => a - b);
}

/**
 * 顧客データから合祀一覧レコードを生成
 * 台帳登録時に自動的に合祀一覧に反映するための関数
 */
export function createCollectiveBurialRecordFromCustomer(
  customerId: string,
  customerCode: string,
  name: string,
  nameKana: string,
  section: CollectiveBurialSection,
  plotNumber: string,
  contractDate: Date,
  burialDate: Date | null
): CollectiveBurialListRecord {
  const { periodType, yearsUntilBurial } = calculateCollectiveBurialPeriod(contractDate);
  const contractYear = contractDate.getFullYear();
  const collectiveBurialYear = contractYear + yearsUntilBurial;

  const newRecord: CollectiveBurialListRecord = {
    id: `CBL-${Date.now()}`,
    customerId,
    customerCode,
    name,
    nameKana,
    section,
    plotNumber,
    contractYear,
    burialDate,
    collectiveBurialYear,
    periodType,
    count: 1,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // モックデータに追加
  mockCollectiveBurialListRecords.push(newRecord);

  return newRecord;
}

/**
 * 合祀一覧レコードを更新
 */
export function updateCollectiveBurialRecord(
  id: string,
  updates: Partial<Omit<CollectiveBurialListRecord, 'id' | 'createdAt'>>
): CollectiveBurialListRecord | null {
  const index = mockCollectiveBurialListRecords.findIndex(r => r.id === id);
  if (index === -1) return null;

  mockCollectiveBurialListRecords[index] = {
    ...mockCollectiveBurialListRecords[index],
    ...updates,
    updatedAt: new Date(),
  };

  return mockCollectiveBurialListRecords[index];
}

/**
 * 合祀一覧レコードを削除
 */
export function deleteCollectiveBurialRecord(id: string): boolean {
  const index = mockCollectiveBurialListRecords.findIndex(r => r.id === id);
  if (index === -1) return false;

  mockCollectiveBurialListRecords.splice(index, 1);
  return true;
}

/**
 * 区画別の統計を取得
 */
export function getCollectiveBurialStatsBySection(): Record<CollectiveBurialSection, number> {
  const stats: Record<CollectiveBurialSection, number> = {
    '阿弥陀': 0,
    '不動': 0,
    '天空': 0,
    '弥勒': 0,
  };

  mockCollectiveBurialListRecords.forEach(r => {
    stats[r.section] += r.count;
  });

  return stats;
}

/**
 * 年別の統計を取得
 */
export function getCollectiveBurialStatsByYear(): Record<number, number> {
  const stats: Record<number, number> = {};

  mockCollectiveBurialListRecords.forEach(r => {
    if (!stats[r.collectiveBurialYear]) {
      stats[r.collectiveBurialYear] = 0;
    }
    stats[r.collectiveBurialYear] += r.count;
  });

  return stats;
}

