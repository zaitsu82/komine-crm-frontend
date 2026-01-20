/**
 * 顧客管理と合祀管理の統合ロジック
 * 合祀申込を顧客データに紐付けて一元管理
 * 台帳登録時に合祀一覧への自動反映も行う
 */

import { Customer } from '@/types/customer';
import { CollectiveBurialApplication } from '@/types/collective-burial';
import { mockCustomers } from '@/lib/data';
import {
  CollectiveBurialSection,
  calculateCollectiveBurialPeriod,
} from '@/types/collective-burial-list';
import {
  createCollectiveBurialRecordFromCustomer,
  mockCollectiveBurialListRecords,
} from '@/lib/collective-burial-list-data';

/**
 * 合祀申込を顧客の合祀情報に変換
 */
export function convertApplicationToCustomerCollectiveBurial(
  application: CollectiveBurialApplication
): NonNullable<Customer['collectiveBurialInfo']>[0] {
  return {
    id: application.id,
    type: application.burialType,
    ceremonies: application.ceremonies.map(ceremony => ({
      id: ceremony.id,
      date: ceremony.date,
      officiant: ceremony.officiant || '',
      religion: ceremony.religion || '',
      participants: ceremony.participants || 0,
      location: ceremony.location || '',
      memo: ceremony.memo
    })),
    persons: application.persons.map(person => ({
      id: person.id,
      name: person.name,
      nameKana: person.nameKana,
      relationship: person.relationship,
      deathDate: person.deathDate,
      age: person.age || undefined,
      gender: person.gender === 'male' || person.gender === 'female' ? person.gender : undefined,
      originalPlotNumber: person.originalPlotNumber,
      transferDate: undefined, // 申込時点では未設定
      certificateNumber: person.certificateNumber,
      memo: person.memo
    })),
    mainRepresentative: application.mainRepresentative,
    totalFee: application.payment.totalFee || undefined,
    documents: application.documents.map(doc => ({
      id: doc.id,
      type: doc.type,
      name: doc.name,
      issuedDate: doc.issuedDate,
      expiryDate: null,
      memo: doc.memo
    })),
    specialRequests: application.specialRequests,
    status: application.status === 'completed' ? 'completed' :
      application.status === 'cancelled' ? 'cancelled' : 'planned',
    createdAt: application.createdAt,
    updatedAt: application.updatedAt
  };
}

/**
 * 顧客コードまたは区画番号から顧客を検索
 */
export function findCustomerByCodeOrPlot(
  customerCode?: string,
  plotSection?: string,
  plotNumber?: string
): Customer | null {
  if (customerCode) {
    const customer = mockCustomers.find(c => c.customerCode === customerCode);
    if (customer) return customer;
  }

  if (plotSection && plotNumber) {
    const customer = mockCustomers.find(c =>
      c.plotInfo?.section === plotSection &&
      c.plotInfo?.plotNumber === plotNumber
    );
    if (customer) return customer;
  }

  return null;
}

/**
 * 合祀申込を顧客データに統合
 */
export function integrateCollectiveBurialToCustomer(
  application: CollectiveBurialApplication,
  customerCode?: string
): { success: boolean; customer?: Customer; error?: string } {
  // 顧客を検索
  const customer = findCustomerByCodeOrPlot(
    customerCode,
    application.plot.section,
    application.plot.number
  );

  if (!customer) {
    return {
      success: false,
      error: '顧客が見つかりません。顧客コードまたは区画情報を確認してください。'
    };
  }

  // 合祀情報を変換
  const collectiveBurialInfo = convertApplicationToCustomerCollectiveBurial(application);

  // 顧客の合祀情報に追加
  if (!customer.collectiveBurialInfo) {
    customer.collectiveBurialInfo = [];
  }

  // 既存の同じIDの情報があれば更新、なければ追加
  const existingIndex = customer.collectiveBurialInfo.findIndex(
    info => info.id === application.id
  );

  if (existingIndex >= 0) {
    customer.collectiveBurialInfo[existingIndex] = collectiveBurialInfo;
  } else {
    customer.collectiveBurialInfo.push(collectiveBurialInfo);
  }

  customer.updatedAt = new Date();

  return {
    success: true,
    customer
  };
}

/**
 * 顧客の合祀情報から故人総数を計算
 */
export function getCustomerCollectiveBurialPersonsCount(customer: Customer): number {
  if (!customer.collectiveBurialInfo) return 0;

  return customer.collectiveBurialInfo.reduce((total, info) => {
    if (info.status !== 'cancelled') {
      return total + info.persons.length;
    }
    return total;
  }, 0);
}

/**
 * 全顧客の合祀人数を集計
 */
export function getTotalCollectiveBurialPersons(): number {
  return mockCustomers.reduce((total, customer) => {
    return total + getCustomerCollectiveBurialPersonsCount(customer);
  }, 0);
}

/**
 * 顧客の最新の合祀情報を取得
 */
export function getCustomerLatestCollectiveBurial(
  customer: Customer
): NonNullable<Customer['collectiveBurialInfo']>[0] | null {
  if (!customer.collectiveBurialInfo || customer.collectiveBurialInfo.length === 0) {
    return null;
  }

  return customer.collectiveBurialInfo.reduce((latest, current) => {
    if (!latest) return current;
    return current.updatedAt > latest.updatedAt ? current : latest;
  }, customer.collectiveBurialInfo[0]);
}

/**
 * 区画ごとの合祀人数を集計
 */
export function getCollectiveBurialPersonsByPlot(): Record<string, number> {
  const plotCounts: Record<string, number> = {};

  mockCustomers.forEach(customer => {
    // plotNumber（顧客直接フィールド）を優先、plotInfo（非推奨）にフォールバック
    const plotNumber = customer.plotNumber || customer.plotInfo?.plotNumber;
    if (!plotNumber) return;

    const section = customer.section || customer.plotInfo?.section || '';
    const plotKey = `${section}-${plotNumber}`;
    const personsCount = getCustomerCollectiveBurialPersonsCount(customer);

    plotCounts[plotKey] = personsCount;
  });

  return plotCounts;
}

/**
 * 顧客の区画情報が納骨堂かどうかを判定
 * 納骨堂の区画（阿弥陀、不動、天空、弥勒）の場合は合祀一覧に追加対象
 */
export function isColumbarium(section?: string): section is CollectiveBurialSection {
  if (!section) return false;
  return ['阿弥陀', '不動', '天空', '弥勒'].includes(section);
}

/**
 * 顧客登録/更新時に合祀一覧へ自動反映
 * 納骨堂契約者の場合、合祀一覧に自動的にレコードを追加
 */
export function syncCustomerToCollectiveBurialList(
  customer: Customer
): { success: boolean; recordId?: string; error?: string } {
  // 納骨堂の区画でない場合はスキップ
  const section = customer.section || customer.plotInfo?.section;
  if (!isColumbarium(section)) {
    return {
      success: true,
      error: '納骨堂契約者ではないため、合祀一覧への追加はスキップされました'
    };
  }

  // 契約日を取得（startDate, permitDate, reservationDate, createdAtの順で優先）
  const contractDate = customer.startDate ||
    customer.permitDate ||
    customer.reservationDate ||
    customer.contractorInfo?.contractDate ||
    customer.createdAt;

  if (!contractDate) {
    return {
      success: false,
      error: '契約日が設定されていません'
    };
  }

  // 区画番号を取得
  const plotNumber = customer.plotNumber ||
    customer.plotInfo?.plotNumber ||
    customer.customerCode;

  if (!plotNumber) {
    return {
      success: false,
      error: '区画番号が設定されていません'
    };
  }

  // 既存レコードがあるか確認
  const existingRecord = mockCollectiveBurialListRecords.find(
    r => r.customerId === customer.id || r.customerCode === customer.customerCode
  );

  if (existingRecord) {
    // 既存レコードを更新
    existingRecord.name = customer.name;
    existingRecord.nameKana = customer.nameKana;
    existingRecord.section = section;
    existingRecord.plotNumber = plotNumber;
    existingRecord.updatedAt = new Date();

    return {
      success: true,
      recordId: existingRecord.id
    };
  }

  // 納骨日を取得（埋葬者情報から最新の日付、または契約日を使用）
  let burialDate: Date | null = null;
  if (customer.buriedPersons && customer.buriedPersons.length > 0) {
    const latestBurial = customer.buriedPersons
      .filter(p => p.burialDate)
      .sort((a, b) => {
        if (!a.burialDate || !b.burialDate) return 0;
        return b.burialDate.getTime() - a.burialDate.getTime();
      })[0];
    burialDate = latestBurial?.burialDate || null;
  }

  // 新規レコードを作成
  const newRecord = createCollectiveBurialRecordFromCustomer(
    customer.id,
    customer.customerCode,
    customer.name,
    customer.nameKana,
    section,
    plotNumber,
    contractDate,
    burialDate
  );

  return {
    success: true,
    recordId: newRecord.id
  };
}

/**
 * 顧客一覧から合祀一覧を一括生成
 * 初期データ移行や再同期時に使用
 */
export function bulkSyncCustomersToCollectiveBurialList(): {
  successCount: number;
  errorCount: number;
  errors: string[];
} {
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  mockCustomers.forEach(customer => {
    const result = syncCustomerToCollectiveBurialList(customer);
    if (result.success && result.recordId) {
      successCount++;
    } else if (!result.success) {
      errorCount++;
      errors.push(`${customer.customerCode}: ${result.error}`);
    }
  });

  return {
    successCount,
    errorCount,
    errors
  };
}

/**
 * 顧客削除時に合祀一覧からも削除
 */
export function removeCustomerFromCollectiveBurialList(
  customerId: string
): boolean {
  const index = mockCollectiveBurialListRecords.findIndex(
    r => r.customerId === customerId
  );

  if (index === -1) {
    return false;
  }

  mockCollectiveBurialListRecords.splice(index, 1);
  return true;
}
