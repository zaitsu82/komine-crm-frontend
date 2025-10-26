/**
 * 顧客管理と合祀管理の統合ロジック
 * 合祀申込を顧客データに紐付けて一元管理
 */

import { Customer } from '@/types/customer';
import { CollectiveBurialApplication } from '@/types/collective-burial';
import { mockCustomers } from '@/lib/data';

/**
 * 合祀申込を顧客の合祀情報に変換
 */
export function convertApplicationToCustomerCollectiveBurial(
  application: CollectiveBurialApplication
): Customer['collectiveBurialInfo'][0] {
  return {
    id: application.id,
    type: application.burialType,
    ceremonies: application.ceremonies.map(ceremony => ({
      id: ceremony.id,
      date: ceremony.date,
      officiant: ceremony.officiant,
      religion: ceremony.religion,
      participants: ceremony.participants || 0,
      location: ceremony.location,
      memo: ceremony.memo
    })),
    persons: application.persons.map(person => ({
      id: person.id,
      name: person.name,
      nameKana: person.nameKana,
      relationship: person.relationship,
      deathDate: person.deathDate,
      age: person.age || undefined,
      gender: person.gender,
      originalPlotNumber: person.originalPlotNumber,
      transferDate: null, // 申込時点では未設定
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
): Customer['collectiveBurialInfo'][0] | null {
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
    if (!customer.plotInfo?.plotNumber) return;

    const plotKey = `${customer.plotInfo.section || ''}-${customer.plotInfo.plotNumber}`;
    const personsCount = getCustomerCollectiveBurialPersonsCount(customer);

    plotCounts[plotKey] = personsCount;
  });

  return plotCounts;
}
